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
     * `useMemo` garante que a ordenação só é recalculada se os recursos ou a configuração de ordenação mudarem.
     */
    const sortedResources = useMemo(() => {
        let sortableItems = [...resources];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
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
            try {
                await apiClient.delete(`/resources/${resourceToDelete.id}`);
                fetchResources();
            } catch (err) { setError('Falha ao excluir o recurso.'); }
        } else if (selectedResources.length > 0) { // Exclusão em massa
            if (!isAdmin) return;
            try {
                await apiClient.delete('/resources', { data: { ids: selectedResources } });
                fetchResources();
            } catch (err) { setError('Falha ao excluir os recursos selecionados.'); }
        }
        closeDeleteModal();
    };

    const handleCloneResource = async (resourceId) => {
        if (!canEdit) return;
        setCloneLoading(resourceId);
        setError('');
        try {
            const { data: clonedResource } = await apiClient.post(`/resources/${resourceId}/clone`);
            navigate(`/resources/edit/${clonedResource.id}`);
        } catch (err) {
            setError('Falha ao clonar o recurso.');
            setCloneLoading(null);
        }
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
        if (!names || names.length === 0) return <span className="text-gray-400">-</span>;
        return (<div className="flex flex-col gap-1">{names.map((name, index) => (<div key={index} className={`inline-flex items-center gap-1.5 text-xs text-left ${colorClass}`}>{icon}<span>{name}</span></div>))}</div>);
    };

    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Recursos</h1>
                <div className="flex items-center gap-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    <button onClick={handleImportClick} disabled={isImporting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50">
                        {isImporting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ArrowUpTrayIcon className="w-5 h-5" />}
                        <span>{isImporting ? 'Importando...' : 'Importar'}</span>
                    </button>
                    <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50">Exportar</button>
                    <Link to="/resources/new" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"><PlusIcon className="w-5 h-5" />Novo</Link>
                </div>
            </div>

            {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
            {success && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}

            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border rounded-md bg-gray-50">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                    <input type="text" name="name" id="name" value={filters.name} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="ex: api-principal" />
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (chave:valor)</label>
                    <input type="text" name="tags" id="tags" value={filters.tags} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="ex: env:prod,app:core" />
                </div>
                <div className="flex items-end">
                    <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Filtrar</button>
                </div>
            </form>
            
            {selectedResources.length > 0 && isAdmin && (
                <div className="bg-sky-50 border border-sky-200 rounded-md p-4 mb-6 flex items-center justify-between">
                    <span className="text-sm font-medium text-sky-800">{selectedResources.length} recurso(s) selecionado(s)</span>
                    <button onClick={() => openDeleteModal(null)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"><TrashIcon className="w-4 h-4"/>Excluir Selecionados</button>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600" checked={resources.length > 0 && selectedResources.length === resources.length} ref={input => { if (input) { input.indeterminate = selectedResources.length > 0 && selectedResources.length < resources.length; } }} onChange={handleSelectAll} /></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button onClick={() => handleSort('name')} className="flex items-center gap-2 group">Nome{sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4"/> : <ArrowDownIcon className="w-4 h-4"/>) : (<ChevronUpDownIcon className="w-4 h-4 text-gray-400"/>)}</button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pais</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filhos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8">Carregando...</td></tr>
                        ) : (
                            sortedResources.map((resource) => (
                                <tr key={resource.id} className={selectedResources.includes(resource.id) ? 'bg-sky-50' : ''}>
                                    <td className="px-6 py-4"><input type="checkbox" className="h-4 w-4 rounded" checked={selectedResources.includes(resource.id)} onChange={(e) => handleSelectOne(e, resource.id)} /></td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{resource.name}</td>
                                    <td className="px-6 py-4"><NameList names={resource.parents} icon={<ArrowUpIcon className="w-3 h-3" />} colorClass="text-green-700" /></td>
                                    <td className="px-6 py-4"><NameList names={resource.children} icon={<ArrowDownIcon className="w-3 h-3" />} colorClass="text-purple-700" /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {resource.tags.map(tag => (
                                                <button key={`${tag.key}-${tag.value}`} onClick={() => handleTagClick(tag)} title={`Filtrar por ${tag.key}:${tag.value}`} className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full flex items-center gap-1 hover:bg-blue-200">
                                                    <TagIcon className="w-3 h-3"/> {tag.key}:{tag.value}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        {canEdit && <button onClick={() => handleCloneResource(resource.id)} disabled={cloneLoading === resource.id} className="text-gray-500 hover:text-indigo-600 mr-4 disabled:opacity-50" title="Clonar">{cloneLoading === resource.id ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <DocumentDuplicateIcon className="w-5 h-5"/>}</button>}
                                        <button onClick={() => navigate(`/resources/edit/${resource.id}`)} className="text-indigo-600 hover:text-indigo-900 mr-4" title="Editar"><PencilIcon className="w-5 h-5"/></button>
                                        {isAdmin && <button onClick={() => openDeleteModal(resource)} className="text-red-600 hover:text-red-900" title="Excluir"><TrashIcon className="w-5 h-5"/></button>}
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
