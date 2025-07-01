import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import './ResourcePage.css';

/**
 * Componente de página para criar ou editar um Recurso.
 *
 * Esta página renderiza um formulário que se adapta para criar um novo recurso
 * ou para editar um já existente, com base na presença de um ID na URL.
 */
const ResourcePage = () => {
    // --- Hooks ---
    /** @type {{id: string}} Obtém os parâmetros da URL, como o ID do recurso em modo de edição. */
    const { id } = useParams();
    /** @type {function} Permite a navegação programática entre as rotas. */
    const navigate = useNavigate();
    /** @type {boolean} Flag que indica se a página está em modo de edição (true) ou criação (false). */
    const isEditing = Boolean(id);

    // --- Estados do Formulário ---
    /** @type {[string, function]} Armazena o nome do recurso. */
    const [name, setName] = useState('');
    /** @type {[string, function]} Armazena a descrição do recurso. */
    const [description, setDescription] = useState('');
    /** @type {[Array<{key: string, value: string}>, function]} Armazena a lista de tags. */
    const [tags, setTags] = useState([{ key: '', value: '' }]);
    /** @type {[Array<string>, function]} Armazena os IDs dos recursos relacionados (filhos). */
    const [relatedResources, setRelatedResources] = useState([]);

    // --- Estados de Dados Auxiliares ---
    /** @type {[Array, function]} Armazena a lista de todos os recursos para preencher o seletor de relações. */
    const [allResources, setAllResources] = useState([]);
    /** @type {[Array, function]} Armazena as chaves de tags existentes para o autocomplete. */
    const [allTagKeys, setAllTagKeys] = useState([]);

    // --- Estados da UI ---
    /** @type {[boolean, function]} Controla a exibição do indicador de carregamento. */
    const [loading, setLoading] = useState(false);
    /** @type {[string, function]} Armazena mensagens de erro para o utilizador. */
    const [error, setError] = useState('');
    /** @type {[string, function]} Armazena mensagens de sucesso para o utilizador. */
    const [success, setSuccess] = useState('');
    
    // --- Permissões ---
    /** @type {object} Contexto de autenticação para obter permissões do utilizador. */
    const { user } = useAuth();
    /** @type {boolean} Flag que indica se o utilizador pode editar ou criar recursos. */
    const canEdit = user?.role === 'administrador' || user?.role === 'usuario';

    /**
     * Busca todos os recursos para preencher o seletor de "recursos relacionados".
     */
    const fetchAllResources = useCallback(async () => {
        try {
            const response = await apiClient.get('/resources');
            setAllResources(response.data.filter(res => res.id !== id));
        } catch (err) {
            setError('Falha ao carregar a lista de recursos.');
        }
    }, [id]);

    /**
     * Busca todas as chaves de tags existentes para a funcionalidade de autocomplete.
     */
    const fetchTagKeys = useCallback(async () => {
        try {
            const response = await apiClient.get('/meta/config');
            setAllTagKeys(response.data.tag_keys || []);
        } catch (err) {
            setError('Falha ao carregar as chaves de tags.');
        }
    }, []);

    /**
     * Busca os dados do recurso específico quando em modo de edição.
     * @param {string} resourceId - O ID do recurso a ser buscado.
     */
    const fetchResourceData = useCallback(async (resourceId) => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/resources/${resourceId}`);
            const resource = response.data;
            setName(resource.name);
            setDescription(resource.description || '');
            setTags(resource.tags.length > 0 ? resource.tags : [{ key: '', value: '' }]);
            setRelatedResources(resource.related_resources || []);
        } catch (err) {
            setError('Falha ao carregar os dados do recurso.');
            navigate('/resources/new');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Efeito que busca todos os dados necessários ao montar o componente.
    useEffect(() => {
        fetchAllResources();
        fetchTagKeys();
        if (isEditing) {
            fetchResourceData(id);
        }
    }, [isEditing, id, fetchAllResources, fetchTagKeys, fetchResourceData]);


    // --- Manipuladores de Eventos do Formulário ---

    /**
     * Adiciona uma nova linha de tag vazia ao estado.
     */
    const handleAddTag = () => {
        setTags([...tags, { key: '', value: '' }]);
    };

    /**
     * Remove uma tag da lista com base no seu índice.
     */
    const handleRemoveTag = (index) => {
        const newTags = tags.filter((_, i) => i !== index);
        setTags(newTags);
    };

    /**
     * Atualiza o valor de uma tag, convertendo a entrada para maiúsculas.
     */
    const handleTagChange = (index, event) => {
        const newTags = tags.map((tag, i) => {
            if (i === index) {
                return { ...tag, [event.target.name]: event.target.value.toUpperCase() };
            }
            return tag;
        });
        setTags(newTags);
    };
    
    /**
     * Manipula a seleção de múltiplos recursos no seletor de relações.
     */
    const handleRelatedResourcesChange = (event) => {
        const options = [...event.target.selectedOptions];
        const values = options.map(option => option.value);
        setRelatedResources(values);
    };

    /**
     * Submete o formulário para criar ou atualizar um recurso.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canEdit) {
            setError("Você não tem permissão para realizar esta ação.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const finalTags = tags.filter(tag => tag.key.trim() !== '' && tag.value.trim() !== '');
        const resourceData = { name, description, tags: finalTags, related_resources: relatedResources };

        try {
            if (isEditing) {
                // Atualiza o recurso existente.
                await apiClient.put(`/resources/${id}`, resourceData);
                setSuccess('Recurso atualizado com sucesso!');
            } else {
                // Cria um novo recurso.
                const response = await apiClient.post('/resources', resourceData);
                setSuccess('Recurso criado com sucesso!');
                navigate(`/resources/edit/${response.data.id}`);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Ocorreu um erro.';
            setError(`Falha ao salvar o recurso: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Renderização do componente
    if (loading && isEditing) return <div className="text-center p-8">Carregando dados do recurso...</div>;

    return (
        <div className="resource-page-container">
            <button onClick={() => navigate('/resources')} className="resource-page-back-button">
                <ArrowLeftIcon className="resource-page-back-icon" />
                Voltar à Lista
            </button>
            <div className="resource-page-card">
                <h1 className="resource-page-title">{isEditing ? 'Editar Recurso' : 'Cadastrar Novo Recurso'}</h1>
                
                {error && <div className="resource-page-error-message">{error}</div>}
                {success && <div className="resource-page-success-message">{success}</div>}
                
                <form onSubmit={handleSubmit} className="resource-page-form">
                    {/* Campo de Nome */}
                    <div className="resource-page-form-group">
                        <label htmlFor="name" className="resource-page-label">Nome do Recurso</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="resource-page-input" />
                    </div>
                    {/* Campo de Descrição */}
                    <div className="resource-page-form-group">
                        <label htmlFor="description" className="resource-page-label">Descrição</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="resource-page-textarea"></textarea>
                    </div>

                    {/* Secção de Tags Dinâmicas */}
                    <fieldset className="resource-page-tags-fieldset">
                        <legend className="resource-page-tags-legend">Tags (Chave/Valor)</legend>
                        <div className="resource-page-tags-list">
                            {tags.map((tag, index) => (
                                <div key={index} className="resource-page-tag-item">
                                    <input type="text" name="key" value={tag.key} onChange={e => handleTagChange(index, e)} placeholder="Chave (ex: AMBIENTE)" className="resource-page-tag-input" list="tag-keys-list"/>
                                    <datalist id="tag-keys-list">
                                        {allTagKeys.map(key => <option key={key} value={key} />)}
                                    </datalist>
                                    <input type="text" name="value" value={tag.value} onChange={e => handleTagChange(index, e)} placeholder="Valor (ex: PRODUCAO)" className="resource-page-tag-input"/>
                                    <button type="button" onClick={() => handleRemoveTag(index)} className="resource-page-remove-tag-button" title="Remover Tag"><TrashIcon className="resource-page-remove-tag-icon" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddTag} className="resource-page-add-tag-button"><PlusIcon className="resource-page-add-tag-icon" />Adicionar Tag</button>
                    </fieldset>
                    
                    {/* Seletor de Relações */}
                    <div className="resource-page-form-group">
                        <label htmlFor="relatedResources" className="resource-page-label">Recursos Relacionados (Filhos)</label>
                        <select id="relatedResources" multiple value={relatedResources} onChange={handleRelatedResourcesChange} className="resource-page-select resource-page-related-resources-select">
                            {allResources.map(res => (<option key={res.id} value={res.id}>{res.name}</option>))}
                        </select>
                        <p className="resource-page-related-resources-help-text">Segure Ctrl (ou Cmd no Mac) para selecionar múltiplos.</p>
                    </div>

                    {/* Botão de Submissão */}
                    {canEdit && (
                         <div className="resource-page-submit-button-wrapper">
                            <button type="submit" disabled={loading} className="resource-page-submit-button">
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResourcePage;
