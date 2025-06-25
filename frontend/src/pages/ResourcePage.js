import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

const ResourcePage = () => {
    // Hooks do React Router para navegação e obtenção de parâmetros da URL
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id); // Define se a página está em modo de edição ou criação

    // Estado do formulário para o recurso
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([{ key: '', value: '' }]);
    const [relatedResources, setRelatedResources] = useState([]);

    // Estado para carregar dados auxiliares
    const [allResources, setAllResources] = useState([]);
    const [allTagKeys, setAllTagKeys] = useState([]);

    // Estado para controle de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Hook de autenticação para verificar permissões
    const { user } = useAuth();
    const canEdit = user?.role === 'administrador' || user?.role === 'usuario';

    // --- Funções de busca de dados ---

    // Busca todos os recursos para preencher o seletor de "recursos relacionados"
    const fetchAllResources = useCallback(async () => {
        try {
            const response = await apiClient.get('/resources');
            // Filtra o recurso atual da lista para não se relacionar consigo mesmo
            setAllResources(response.data.filter(res => res.id !== id));
        } catch (err) {
            setError('Falha ao carregar a lista de recursos.');
        }
    }, [id]);

    // Busca todas as chaves de tags existentes para o autocomplete
    const fetchTagKeys = useCallback(async () => {
        try {
            const response = await apiClient.get('/meta/config');
            setAllTagKeys(response.data.tag_keys || []);
        } catch (err) {
            setError('Falha ao carregar as chaves de tags.');
        }
    }, []);

    // Busca os dados do recurso específico quando em modo de edição
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
            navigate('/resources/new'); // Redireciona se não encontrar o recurso
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Efeito para buscar todos os dados necessários ao montar o componente
    useEffect(() => {
        fetchAllResources();
        fetchTagKeys();
        if (isEditing) {
            fetchResourceData(id);
        }
    }, [isEditing, id, fetchAllResources, fetchTagKeys, fetchResourceData]);


    // --- Funções de manipulação do formulário ---

    // Adiciona uma nova linha de tag vazia
    const handleAddTag = () => {
        setTags([...tags, { key: '', value: '' }]);
    };

    // Remove uma tag pelo seu índice
    const handleRemoveTag = (index) => {
        const newTags = tags.filter((_, i) => i !== index);
        setTags(newTags);
    };

    // Atualiza o valor de uma tag (chave ou valor)
    const handleTagChange = (index, event) => {
        const newTags = tags.map((tag, i) => {
            if (i === index) {
                return { ...tag, [event.target.name]: event.target.value };
            }
            return tag;
        });
        setTags(newTags);
    };
    
    // Manipula a seleção de múltiplos recursos relacionados
    const handleRelatedResourcesChange = (event) => {
        const options = [...event.target.selectedOptions];
        const values = options.map(option => option.value);
        setRelatedResources(values);
    };

    // --- Submissão do formulário ---
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canEdit) {
            setError("Você não tem permissão para realizar esta ação.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        // Filtra tags vazias antes de enviar
        const finalTags = tags.filter(tag => tag.key.trim() !== '' && tag.value.trim() !== '');

        const resourceData = {
            name,
            description,
            tags: finalTags,
            related_resources: relatedResources
        };

        try {
            if (isEditing) {
                // Atualiza o recurso existente
                await apiClient.put(`/resources/${id}`, resourceData);
                setSuccess('Recurso atualizado com sucesso!');
            } else {
                // Cria um novo recurso
                const response = await apiClient.post('/resources', resourceData);
                setSuccess('Recurso criado com sucesso!');
                // Redireciona para a página de edição do novo recurso
                navigate(`/resources/edit/${response.data.id}`);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Ocorreu um erro.';
            setError(`Falha ao salvar o recurso: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <div className="text-center p-8">Carregando dados do recurso...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-4 text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-4 h-4" />
                Voltar ao Mapa
            </button>
            <div className="p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    {isEditing ? 'Editar Recurso' : 'Cadastrar Novo Recurso'}
                </h1>
                
                {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                {success && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campos de Nome e Descrição */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Recurso</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>

                    {/* Seção de Tags */}
                    <fieldset className="p-4 border rounded-md">
                        <legend className="text-sm font-medium text-gray-900 px-2">Tags (Chave/Valor)</legend>
                        <div className="space-y-4">
                            {tags.map((tag, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        name="key"
                                        value={tag.key}
                                        onChange={e => handleTagChange(index, e)}
                                        placeholder="Chave (ex: ambiente)"
                                        className="flex-1 block w-full border-gray-300 rounded-md shadow-sm"
                                        list="tag-keys-list"
                                    />
                                    <datalist id="tag-keys-list">
                                        {allTagKeys.map(key => <option key={key} value={key} />)}
                                    </datalist>
                                    <input
                                        type="text"
                                        name="value"
                                        value={tag.value}
                                        onChange={e => handleTagChange(index, e)}
                                        placeholder="Valor (ex: producao)"
                                        className="flex-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    />
                                    <button type="button" onClick={() => handleRemoveTag(index)} className="p-2 text-red-600 hover:text-red-800">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddTag} className="flex items-center gap-2 mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            <PlusIcon className="w-5 h-5" />
                            Adicionar Tag
                        </button>
                    </fieldset>
                    
                    {/* Seção de Recursos Relacionados */}
                    <div>
                        <label htmlFor="relatedResources" className="block text-sm font-medium text-gray-700">Recursos Relacionados</label>
                        <select
                            id="relatedResources"
                            multiple
                            value={relatedResources}
                            onChange={handleRelatedResourcesChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm h-40"
                        >
                            {allResources.map(res => (
                                <option key={res.id} value={res.id}>{res.name}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Segure Ctrl (ou Cmd no Mac) para selecionar múltiplos.</p>
                    </div>

                    {/* Botão de Salvar */}
                    {canEdit && (
                         <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
                            >
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
