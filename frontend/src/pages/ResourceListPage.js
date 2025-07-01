import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { PencilIcon, TrashIcon, PlusIcon, TagIcon, ArrowUpIcon, ArrowDownIcon, DocumentDuplicateIcon, ArrowUpTrayIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';

/**
 * Componente de página para listar e gerir todos os Recursos.
 *
 * Funcionalidades:
 * - Exibe uma tabela com todos os recursos.
 * - Permite filtrar a lista por nome e tags.
 * - Permite ordenar a lista pelo nome do recurso.
 * - Permite filtrar rapidamente a lista ao clicar numa tag.
 * - Habilita a seleção de múltiplos recursos através de checkboxes.
 * - Oferece ações em massa para os itens selecionados (ex: excluir).
 * - Permite exportar a lista de recursos visível para um ficheiro JSON.
 * - Permite importar recursos a partir de um ficheiro JSON.
 */
const ResourceListPage = () => {
    // --- Hooks ---
    /** @type {function} Navegação programática usando o React Router. */
    const navigate = useNavigate();
    /** @type {object} Contexto de autenticação para obter dados do utilizador e permissões. */
    const { user } = useAuth();
    
    // --- Estados da UI e de Dados ---
    /** @type {[Array, function]} Armazena a lista de recursos vinda da API. */
    const [resources, setResources] = useState([]);
    /** @type {[boolean, function]} Controla a exibição do indicador de carregamento principal da página. */
    const [loading, setLoading] = useState(true);
    /** @type {[string, function]} Armazena mensagens de erro para exibição ao utilizador. */
    const [error, setError] = useState('');
    /** @type {[string, function]} Armazena mensagens de sucesso (ex: após importação) para exibição. */
    const [success, setSuccess] = useState('');
    /** @type {[object, function]} Armazena os valores atuais dos campos de filtro. */
    const [filters, setFilters] = useState({ name: '', tags: '' });
    /** @type {[object, function]} Armazena a configuração de ordenação da tabela (coluna e direção). */
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    // --- Estados para Seleção e Ações em Massa ---
    /** @type {[Array<string>, function]} Armazena os IDs dos recursos selecionados na tabela. */
    const [selectedResources, setSelectedResources] = useState([]);
    /** @type {[boolean, function]} Controla a visibilidade do modal de confirmação para exclusão. */
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    /** @type {[object|null, function]} Guarda o recurso específico a ser excluído individualmente. */
    const [resourceToDelete, setResourceToDelete] = useState(null);

    // --- Estados para Ações Individuais e Importação ---
    /** @type {[boolean, function]} Controla o estado de carregamento do botão de importação. */
    const [isImporting, setIsImporting] = useState(false);
    /** @type {[string|null, function]} Guarda o ID do recurso que está a ser clonado para exibir um loading. */
    const [cloneLoading, setCloneLoading] = useState(null);
    /** @type {React.RefObject} Referência para o elemento de input de ficheiro, que fica oculto. */
    const fileInputRef = useRef(null);

    // --- Permissões ---
    /** @type {boolean} Flag que indica se o utilizador tem permissão para editar (admin ou usuario). */
    const canEdit = user?.role === 'administrador' || user?.role === 'usuario';
    /** @type {boolean} Flag que indica se o utilizador é um administrador. */
    const isAdmin = user?.role === 'administrador';

    /**
     * Função assíncrona para buscar os recursos da API, com base nos filtros.
     */
    const fetchResources = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (filters.name) params.append('name', filters.name);
            if (filters.tags) params.append('tags', filters.tags);
            const { data } = await apiClient.get(`/resources?${params.toString()}`);
            setResources(data);
            setSelectedResources([]);
        } catch (err) {
            setError('Falha ao carregar recursos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    /**
     * Manipula a mudança de estado dos filtros de texto.
     */
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    /**
     * Aciona a busca de recursos quando o formulário de filtro é submetido.
     */
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchResources();
    };

    /**
     * Manipula a ordenação da tabela.
     */
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    /**
     * Filtra a lista ao clicar numa tag específica.
     */
    const handleTagClick = (tag) => {
        const newFilter = `${tag.key}:${tag.value}`;
        setFilters(prevFilters => ({
            ...prevFilters,
            tags: newFilter
        }));
    };

    /**
     * Ordena os recursos localmente para exibição na tabela.
     */
    const sortedResources = useMemo(() => {
        let sortableItems = [...resources];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA.localeCompare(valB) < 0) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA.localeCompare(valB) > 0) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [resources, sortConfig]);

    // --- Lógica para Seleção e Ações em Massa ---
    const handleSelectOne = (e, id) => { if (e.target.checked) { setSelectedResources(prev => [...prev, id]); } else { setSelectedResources(prev => prev.filter(resId => resId !== id)); } };
    const handleSelectAll = (e) => { if (e.target.checked) { setSelectedResources(resources.map(res => res.id)); } else { setSelectedResources([]); } };
    const openDeleteModal = (resource = null) => { setResourceToDelete(resource); setIsConfirmModalOpen(true); };
    const closeDeleteModal = () => { setIsConfirmModalOpen(false); setResourceToDelete(null); };

    const handleConfirmDelete = async () => {
        setError('');
        if (resourceToDelete) { // Exclusão individual
            if (!isAdmin) return;
            try { await apiClient.delete(`/resources/${resourceToDelete.id}`); fetchResources(); } catch (err) { setError('Falha ao excluir o recurso.'); }
        } else if (selectedResources.length > 0) { // Exclusão em massa
            if (!isAdmin) return;
            try { await apiClient.delete('/resources', { data: { ids: selectedResources } }); fetchResources(); } catch (err) { setError('Falha ao excluir os recursos selecionados.'); }
        }
        closeDeleteModal();
    };

    const handleCloneResource = async (resourceId) => {
        if (!canEdit) return;
        setCloneLoading(resourceId);
        setError('');
        try { const { data: clonedResource } = await apiClient.post(`/resources/${resourceId}/clone`); navigate(`/resources/edit/${clonedResource.id}`); } 
        catch (err) { setError('Falha ao clonar o recurso.'); setCloneLoading(null); }
    };

    const handleExport = () => {
        if (sortedResources.length === 0) return;
        const exportData = sortedResources.map(res => ({
            name: res.name,
            description: res.description,
            tags: res.tags,
            related_resources: res.children || []
        }));
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'recursos.json'; a.click(); URL.revokeObjectURL(url);
    };

    const handleImportClick = () => { fileInputRef.current.click(); };
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsImporting(true); setError(''); setSuccess('');
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const rawImportData = JSON.parse(e.target.result);
                const resourcesToImport = rawImportData.map(res => ({ ...res, related_resources: res.children || res.related_resources || [] }));
                const { data } = await apiClient.post('/resources/import', resourcesToImport);
                setSuccess(`Importação concluída: ${data.created} criados, ${data.updated} atualizados.`);
                if (data.errors && data.errors.length > 0) { setError(`Ocorreram erros: ${data.errors.join('; ')}`); }
                fetchResources();
            } catch (err) {
                setError(err.response?.data?.detail || 'Falha ao processar ou importar o ficheiro.');
            } finally { setIsImporting(false); }
        };
        reader.onerror = () => { setError('Falha ao ler o ficheiro.'); setIsImporting(false); };
        reader.readAsText(file);
        event.target.value = null;
    };
    
    const NameList = ({ names, icon, colorClass }) => {
        if (!names || names.length === 0) return <span className="resource-list-name-list-no-items">-</span>;
        return (<div className="resource-list-name-list-container">{names.map((name, index) => (<div key={index} className={`resource-list-name-list-item ${colorClass}`}>{icon}<span>{name}</span></div>))}</div>);
    };

    return (
        <div className="resource-list-page-container">
            <div className="resource-list-header">
                <h1 className="resource-list-title">Gerenciamento de Recursos</h1>
                <div className="resource-list-actions">
                    {canEdit && (<><input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="resource-list-import-input" /><button onClick={handleImportClick} disabled={isImporting} className="resource-list-import-button">{isImporting ? <div className="resource-list-import-loading-spinner"></div> : <ArrowUpTrayIcon className="resource-list-import-icon" />}<span>{isImporting ? 'Importando...' : 'Importar'}</span></button></>)}
                    <button onClick={handleExport} className="resource-list-export-button">Exportar</button>
                    {canEdit && (<Link to="/resources/new" className="resource-list-new-button"><PlusIcon className="resource-list-new-icon" />Novo</Link>)}
                </div>
            </div>

            {error && <div className="resource-list-error-message">{error}</div>}
            {success && <div className="resource-list-success-message">{success}</div>}

            <form onSubmit={handleFilterSubmit} className="resource-list-filters-form">
                <div><label htmlFor="name" className="resource-list-filter-label">Nome</label><input type="text" name="name" id="name" value={filters.name} onChange={handleFilterChange} className="resource-list-filter-input" placeholder="ex: api-principal" /></div>
                <div><label htmlFor="tags" className="resource-list-filter-label">Tags (chave:valor)</label><input type="text" name="tags" id="tags" value={filters.tags} onChange={handleFilterChange} className="resource-list-filter-input" placeholder="ex: env:prod,app:core" /></div>
                <div className="resource-list-filter-button-wrapper"><button type="submit" className="resource-list-filter-button">Filtrar</button></div>
            </form>
            
            {selectedResources.length > 0 && isAdmin && (
                <div className="resource-list-bulk-actions-bar">
                    <span className="resource-list-bulk-actions-text">{selectedResources.length} recurso(s) selecionado(s)</span>
                    <button onClick={() => openDeleteModal(null)} className="resource-list-bulk-delete-button"><TrashIcon className="resource-list-bulk-delete-icon"/>Excluir Selecionados</button>
                </div>
            )}
            
            <div className="resource-list-table-wrapper">
                <table className="resource-list-table">
                    <thead className="resource-list-table-header">
                        <tr>
                            <th className="resource-list-table-header-cell"><input type="checkbox" className="resource-list-table-header-checkbox" checked={resources.length > 0 && selectedResources.length === resources.length} ref={input => { if (input) { input.indeterminate = selectedResources.length > 0 && selectedResources.length < resources.length; } }} onChange={handleSelectAll} /></th>
                            <th className="resource-list-table-header-cell"><button onClick={() => handleSort('name')} className="resource-list-table-header-sort-button">Nome{sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? <ArrowUpIcon className="resource-list-table-header-sort-icon"/> : <ArrowDownIcon className="resource-list-table-header-sort-icon"/>) : (<ChevronUpDownIcon className="resource-list-table-header-sort-icon-default"/>)}</button></th>
                            <th className="resource-list-table-header-cell">Pais</th>
                            <th className="resource-list-table-header-cell">Filhos</th>
                            <th className="resource-list-table-header-cell">Tags</th>
                            <th className="resource-list-table-header-cell">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="resource-list-table-body">
                        {loading ? (
                            <tr><td colSpan="6" className="resource-list-table-row-loading">Carregando...</td></tr>
                        ) : (
                            sortedResources.map((resource) => (
                                <tr key={resource.id} className={selectedResources.includes(resource.id) ? 'resource-list-table-row-selected' : ''}>
                                    <td className="resource-list-table-cell"><input type="checkbox" className="resource-list-table-cell-checkbox" checked={selectedResources.includes(resource.id)} onChange={(e) => handleSelectOne(e, resource.id)} /></td>
                                    <td className="resource-list-table-cell resource-list-table-cell-name">{resource.name}</td>
                                    <td className="resource-list-table-cell"><NameList names={resource.parents} icon={<ArrowUpIcon className="resource-list-name-list-icon" />} colorClass="text-green-700" /></td>
                                    <td className="resource-list-table-cell"><NameList names={resource.children} icon={<ArrowDownIcon className="resource-list-name-list-icon" />} colorClass="text-purple-700" /></td>
                                    <td className="resource-list-table-cell"><div className="resource-list-tags-container">{resource.tags.map(tag => (<button key={`${tag.key}-${tag.value}`} onClick={() => handleTagClick(tag)} title={`Filtrar por ${tag.key}:${tag.value}`} className="resource-list-tag-button"><TagIcon className="resource-list-tag-icon"/> {tag.key}:{tag.value}</button>))}</div></td>
                                    <td className="resource-list-actions-cell">
                                        {canEdit && <button onClick={() => handleCloneResource(resource.id)} disabled={cloneLoading === resource.id} className="resource-list-action-button" title="Clonar">{cloneLoading === resource.id ? <div className="resource-list-action-button-clone-loading"></div> : <DocumentDuplicateIcon className="resource-list-action-icon"/>}</button>}
                                        {canEdit && <button onClick={() => navigate(`/resources/edit/${resource.id}`)} className="resource-list-action-button resource-list-action-button-edit" title="Editar"><PencilIcon className="resource-list-action-icon"/></button>}
                                        {isAdmin && <button onClick={() => openDeleteModal(resource)} className="resource-list-action-button resource-list-action-button-delete" title="Excluir"><TrashIcon className="resource-list-action-icon"/></button>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message={resourceToDelete ? `Você tem certeza que deseja excluir o recurso "${resourceToDelete.name}"?` : `Você tem certeza que deseja excluir os ${selectedResources.length} recursos selecionados? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};

export default ResourceListPage;
