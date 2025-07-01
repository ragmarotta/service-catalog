import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import Modal from '../components/Modal'; // Componente de Modal reutilizável
import ConfirmationModal from '../components/ConfirmationModal'; // Componente de confirmação
import { PencilIcon, TrashIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import './UserManagementPage.css';

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
            <form onSubmit={handleSubmit} className="user-form-container">
                {/* Campos do formulário */}
                <div className="user-form-group">
                    <label className="user-form-label">Usuário</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!user} className="user-form-input user-form-input-disabled" />
                </div>
                <div className="user-form-group">
                    <label className="user-form-label">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="user-form-input" />
                </div>
                <div className="user-form-group">
                    <label className="user-form-label">Nome Completo</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="user-form-input" />
                </div>
                <div className="user-form-group">
                    <label className="user-form-label">Senha</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={user ? 'Deixe em branco para não alterar' : 'Senha obrigatória'} className="user-form-input" />
                </div>
                <div className="user-form-group">
                    <label className="user-form-label">Permissão</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="user-form-select">
                        <option value="administrador">Administrador</option>
                        <option value="usuario">Usuário</option>
                        <option value="visualizador">Visualizador</option>
                    </select>
                </div>
                <div className="user-form-checkbox-group">
                    <input type="checkbox" id="disabled" name="disabled" checked={formData.disabled} onChange={handleChange} className="user-form-checkbox" />
                    <label htmlFor="disabled" className="user-form-checkbox-label">Desabilitado</label>
                </div>
                {/* Botões de Ação */}
                <div className="user-form-actions">
                    <button type="button" onClick={onCancel} className="user-form-cancel-button">Cancelar</button>
                    <button type="submit" className="user-form-submit-button">Salvar</button>
                </div>
            </form>
        );
    };


    return (
        <div className="user-management-page-container">
            <div className="user-management-header">
                <h1 className="user-management-title">Gerenciamento de Usuários</h1>
                <button onClick={() => handleOpenModal()} className="user-management-new-user-button">
                    <PlusIcon className="user-management-new-user-icon" />
                    Novo Usuário
                </button>
            </div>
            {loading && <p className="user-management-loading-message">Carregando...</p>}
            {error && <p className="user-management-error-message">{error}</p>}
            
            {/* Tabela de Usuários */}
            {!loading && !error && (
                <div className="user-management-table-wrapper">
                    <table className="user-management-table">
                        <thead className="user-management-table-header">
                            <tr>
                                <th className="user-management-table-header-cell">Usuário</th>
                                <th className="user-management-table-header-cell">Permissão</th>
                                <th className="user-management-table-header-cell">Status</th>
                                <th className="user-management-table-header-cell">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="user-management-table-body">
                            {users.map((user) => (
                                <tr key={user.id} className="user-management-table-row">
                                    <td className="user-management-table-cell">
                                        <div className="user-management-user-info">
                                            <UserCircleIcon className="user-management-user-icon" />
                                            <div className="user-management-user-details">
                                                <div className="user-management-user-name">{user.full_name || user.username}</div>
                                                <div className="user-management-user-email">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="user-management-table-cell user-management-user-role">{user.role}</td>
                                    <td className="user-management-table-cell">
                                        <span className={`user-management-user-status ${user.disabled ? 'user-management-user-status-disabled' : 'user-management-user-status-active'}`}>
                                            {user.disabled ? 'Desabilitado' : 'Ativo'}
                                        </span>
                                    </td>
                                    <td className="user-management-actions-cell">
                                        <button onClick={() => handleOpenModal(user)} className="user-management-action-button"><PencilIcon className="user-management-action-icon"/></button>
                                        {user.username !== 'root' && (
                                            <button onClick={() => handleOpenConfirmModal(user)} className="user-management-delete-button"><TrashIcon className="user-management-action-icon"/></button>
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
