import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await auth.login(username, password);
        setLoading(false);
        if (success) {
            navigate(from, { replace: true });
        } else {
            setError('Falha no login. Verifique seu usuário e senha.');
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-card">
                <div className="login-header-text-center">
                    <h2 className="login-title">Catálogo de Serviços</h2>
                    <p className="login-subtitle">Faça login para acessar sua conta</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="login-error-message" role="alert">
                            {error}
                        </div>
                    )}
                    <div className="login-input-wrapper">
                        <UserIcon className="login-input-icon"/>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            className="login-input-field"
                            placeholder="Usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="login-input-wrapper">
                        <LockClosedIcon className="login-input-icon"/>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="login-input-field"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="login-submit-button-wrapper">
                        <button
                            type="submit"
                            disabled={loading}
                            className="login-submit-button"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
