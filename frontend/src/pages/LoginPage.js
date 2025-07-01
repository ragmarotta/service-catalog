import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';
import apiClient from '../services/api';
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthConfig, setOauthConfig] = useState(null);
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        const fetchOauthConfig = async () => {
            try {
                const response = await apiClient.get('/config');
                setOauthConfig(response.data);
            } catch (err) {
                console.error("Error fetching OAuth config:", err);
            }
        };
        fetchOauthConfig();
    }, []);

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

    const handleOAuthLogin = () => {
        if (oauthConfig && oauthConfig.oauth2_enabled && oauthConfig.oauth2_provider_url) {
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: oauthConfig.oauth2_client_id,
                redirect_uri: oauthConfig.oauth2_redirect_uri,
                scope: oauthConfig.oauth2_scope,
                state: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Simple state for now
            });
            window.location.href = `${oauthConfig.oauth2_provider_url}/authorize?${params.toString()}`;
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
                {oauthConfig?.oauth2_enabled && (
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={handleOAuthLogin}
                            className="login-submit-button bg-blue-600 hover:bg-blue-700"
                        >
                            {oauthConfig.oauth2_login_button_text}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
