import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { PencilIcon, TrashIcon, PlusIcon, TagIcon, ArrowUpIcon, ArrowDownIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';

const ResourceListPage = () => {
    // Hooks
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Estados da UI
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cloneLoading, setCloneLoading] = useState(null); // Estado de loading por item
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ name: '', tags: '' });

    // Estados dos Modais
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);

    // Permissões
    const canEdit = user?.role === 'administrador' || user?.role === 'usuario';
    const isAdmin = user?.role === 'administrador';

    // Função para buscar os recursos da API
    const fetchResources = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (filters.name) params.append('name', filters.name);
            if (filters.tags) params.append('tags', filters.tags);
            const { data } = await apiClient.get(`/resources?${params.toString()}`);
            setResources(data);
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

    // Manipuladores de eventos
    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchResources();
    };

    // Funções para o modal de exclusão
    const openDeleteModal = (resource) => {
        setResourceToDelete(resource);
        setIsConfirmModalOpen(true);
    };
    const closeDeleteModal = () => setIsConfirmModalOpen(false);

    const handleDeleteResource = async () => {
        if (!resourceToDelete || !isAdmin) return;
        try {
            await apiClient.delete(`/resources/${resourceToDelete.id}`);
            closeDeleteModal();
            fetchResources();
        } catch (err) {
            setError('Falha ao excluir o recurso.');
            closeDeleteModal();
        }
    };

    // Nova função para clonar o recurso
    const handleCloneResource = async (resourceId) => {
        if (!canEdit) return;
        setCloneLoading(resourceId); // Ativa o loading para este item específico
        setError('');
        try {
            const { data: clonedResource } = await apiClient.post(`/resources/${resourceId}/clone`);
            navigate(`/resources/edit/${clonedResource.id}`);
        } catch (err) {
            setError('Falha ao clonar o recurso.');
            console.error(err);
            setCloneLoading(null);
        }
    };
    
    // Componente para renderizar listas de nomes de forma limpa
    const NameList = ({ names, icon, colorClass }) => {
        if (!names || names.length === 0) return <span className="text-gray-400">-</span>;
        return (
            <div className="flex flex-col gap-1">
                {names.map((name, index) => (
                    <div key={index} className={`inline-flex items-center gap-1.5 text-xs text-left ${colorClass}`}>
                        {icon}
                        <span>{name}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Recursos</h1>
                <Link to="/resources/new" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5" />
                    Novo Recurso
                </Link>
            </div>

            {/* Formulário de Filtros */}
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

            {error && <p className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</p>}
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pais</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filhos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-8">Carregando...</td></tr>
                        ) : (
                            resources.map((resource) => (
                                <tr key={resource.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{resource.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><NameList names={resource.parents} icon={<ArrowUpIcon className="w-3 h-3" />} colorClass="text-green-700" /></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><NameList names={resource.children} icon={<ArrowDownIcon className="w-3 h-3" />} colorClass="text-purple-700" /></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {resource.tags.slice(0, 3).map(tag => (
                                                <span key={`${tag.key}-${tag.value}`} className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full flex items-center gap-1">
                                                    <TagIcon className="w-3 h-3"/> {tag.key}:{tag.value}
                                                </span>
                                            ))}
                                            {resource.tags.length > 3 && <span className="text-xs font-semibold">...</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {canEdit && (
                                            <button onClick={() => handleCloneResource(resource.id)} disabled={cloneLoading === resource.id} className="text-gray-500 hover:text-indigo-600 mr-4 disabled:opacity-50" title="Clonar Recurso">
                                                {cloneLoading === resource.id ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <DocumentDuplicateIcon className="w-5 h-5"/>}
                                            </button>
                                        )}
                                        <button onClick={() => navigate(`/resources/edit/${resource.id}`)} className="text-indigo-600 hover:text-indigo-900 mr-4" title="Editar Recurso"><PencilIcon className="w-5 h-5"/></button>
                                        {isAdmin && (
                                            <button onClick={() => openDeleteModal(resource)} className="text-red-600 hover:text-red-900" title="Excluir Recurso"><TrashIcon className="w-5 h-5"/></button>
                                        )}
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
                onConfirm={handleDeleteResource}
                title="Confirmar Exclusão de Recurso"
                message={`Você tem certeza que deseja excluir o recurso "${resourceToDelete?.name}"? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};

export default ResourceListPage;
