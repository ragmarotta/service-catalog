import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

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
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/resources')} className="flex items-center gap-2 mb-4 text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-4 h-4" />
                Voltar à Lista
            </button>
            <div className="p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Recurso' : 'Cadastrar Novo Recurso'}</h1>
                
                {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                {success && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo de Nome */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Recurso</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    {/* Campo de Descrição */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>

                    {/* Secção de Tags Dinâmicas */}
                    <fieldset className="p-4 border rounded-md">
                        <legend className="text-sm font-medium text-gray-900 px-2">Tags (Chave/Valor)</legend>
                        <div className="space-y-4">
                            {tags.map((tag, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <input type="text" name="key" value={tag.key} onChange={e => handleTagChange(index, e)} placeholder="Chave (ex: AMBIENTE)" className="flex-1 block w-full border-gray-300 rounded-md shadow-sm uppercase" list="tag-keys-list"/>
                                    <datalist id="tag-keys-list">
                                        {allTagKeys.map(key => <option key={key} value={key} />)}
                                    </datalist>
                                    <input type="text" name="value" value={tag.value} onChange={e => handleTagChange(index, e)} placeholder="Valor (ex: PRODUCAO)" className="flex-1 block w-full border-gray-300 rounded-md shadow-sm uppercase"/>
                                    <button type="button" onClick={() => handleRemoveTag(index)} className="p-2 text-red-600 hover:text-red-800" title="Remover Tag"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddTag} className="flex items-center gap-2 mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800"><PlusIcon className="w-5 h-5" />Adicionar Tag</button>
                    </fieldset>
                    
                    {/* Seletor de Relações */}
                    <div>
                        <label htmlFor="relatedResources" className="block text-sm font-medium text-gray-700">Recursos Relacionados (Filhos)</label>
                        <select id="relatedResources" multiple value={relatedResources} onChange={handleRelatedResourcesChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm h-40">
                            {allResources.map(res => (<option key={res.id} value={res.id}>{res.name}</option>))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Segure Ctrl (ou Cmd no Mac) para selecionar múltiplos.</p>
                    </div>

                    {/* Botão de Submissão */}
                    {canEdit && (
                         <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="px-6 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
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
