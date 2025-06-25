import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import Modal from '../components/Modal'; // Componente de Modal reutilizável
import ConfirmationModal from '../components/ConfirmationModal'; // Componente de confirmação
import { PencilIcon, TrashIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/solid';

const UserManagementPage = () => {
    // Estado para armazenar a lista de usuários
    const [users, setUsers] = useState([]);
    // Estado para controlar a UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Estado para os modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    // Estado para o usuário sendo editado ou deletado
    const [currentUser, setCurrentUser] = useState(null);

    // Função para buscar todos os usuários da API
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data);
        } catch (err) {
            setError('Falha ao carregar usuários.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Busca os usuários ao carregar a página
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- Funções de manipulação dos modais ---
    const handleOpenModal = (user = null) => {
        setCurrentUser(user); // Se user for nulo, é um novo usuário
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleOpenConfirmModal = (user) => {
        setCurrentUser(user);
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setCurrentUser(null);
    };

    // --- Funções de CRUD ---
    const handleSaveUser = async (userData) => {
        try {
            if (currentUser) {
                // Editando um usuário existente
                await apiClient.put(`/users/${currentUser.id}`, userData);
            } else {
                // Criando um novo usuário
                await apiClient.post('/users', userData);
            }
            handleCloseModal();
            fetchUsers(); // Recarrega a lista de usuários
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Erro ao salvar usuário.';
            alert(errorMessage); // Usar um componente de notificação seria melhor
        }
    };

    const handleDeleteUser = async () => {
        if (!currentUser) return;
        try {
            await apiClient.delete(`/users/${currentUser.id}`);
            handleCloseConfirmModal();
            fetchUsers(); // Recarrega a lista de usuários
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Erro ao deletar usuário.';
            alert(errorMessage);
        }
    };
    
    // Componente interno para o formulário de usuário, para ser usado no modal
    const UserForm = ({ user, onSave, onCancel }) => {
        const [formData, setFormData] = useState({
            username: user?.username || '',
            email: user?.email || '',
            full_name: user?.full_name || '',
            password: '',
            role: user?.role || 'visualizador',
            disabled: user?.disabled || false,
        });

        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            // Em edição, não enviar senha se estiver vazia
            const dataToSend = { ...formData };
            if (user && !dataToSend.password) {
                delete dataToSend.password;
            } else if (!user && !dataToSend.password) {
                alert("A senha é obrigatória para novos usuários.");
                return;
            }
            onSave(dataToSend);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campos do formulário */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Usuário</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!user} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Senha</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={user ? 'Deixe em branco para não alterar' : 'Senha obrigatória'} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Permissão</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                        <option value="administrador">Administrador</option>
                        <option value="usuario">Usuário</option>
                        <option value="visualizador">Visualizador</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="disabled" name="disabled" checked={formData.disabled} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    <label htmlFor="disabled" className="ml-2 block text-sm text-gray-900">Desabilitado</label>
                </div>
                {/* Botões de Ação */}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Salvar</button>
                </div>
            </form>
        );
    };


    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5" />
                    Novo Usuário
                </button>
            </div>
            {loading && <p>Carregando...</p>}
            {error && <p className="text-red-500">{error}</p>}
            
            {/* Tabela de Usuários */}
            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissão</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserCircleIcon className="w-8 h-8 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.full_name || user.username}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.disabled ? 'Desabilitado' : 'Ativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="w-5 h-5"/></button>
                                        {user.username !== 'root' && (
                                            <button onClick={() => handleOpenConfirmModal(user)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para criar/editar usuário */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentUser ? 'Editar Usuário' : 'Novo Usuário'}>
                <UserForm user={currentUser} onSave={handleSaveUser} onCancel={handleCloseModal} />
            </Modal>

            {/* Modal de confirmação para deletar */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
                onConfirm={handleDeleteUser}
                title="Confirmar Exclusão"
                message={`Você tem certeza que deseja excluir o usuário "${currentUser?.username}"? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};

export default UserManagementPage;
