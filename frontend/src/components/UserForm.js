import React, { useState } from 'react';
import './UserForm.css';

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

export default UserForm;