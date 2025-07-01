import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const SettingsPage = () => {
    const [config, setConfig] = useState({
        icon_url: '',
        oauth2_enabled: false,
        oauth2_provider_url: '',
        oauth2_client_id: '',
        oauth2_client_secret: '',
        oauth2_scope: 'openid email profile',
        oauth2_redirect_uri: '',
        oauth2_userinfo_url: '',
        oauth2_username_attribute: 'preferred_username',
        oauth2_email_attribute: 'email',
        oauth2_login_button_text: 'Login with OAuth2',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await apiClient.get('/config');
                setConfig(response.data);
            } catch (err) {
                setError('Falha ao carregar as configurações.');
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prevConfig => ({
            ...prevConfig,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await apiClient.put('/config', config);
            setSuccess('Configurações salvas com sucesso!');
        } catch (err) {
            setError('Falha ao salvar as configurações.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4">Carregando configurações...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Configurações da Aplicação</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold">Ícone da Aplicação</legend>
                    <div>
                        <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700">URL do Ícone:</label>
                        <input
                            type="text"
                            name="icon_url"
                            id="icon_url"
                            value={config.icon_url || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            placeholder="Ex: https://example.com/icon.png"
                        />
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold">Configuração OAuth2</legend>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            name="oauth2_enabled"
                            id="oauth2_enabled"
                            checked={config.oauth2_enabled}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label htmlFor="oauth2_enabled" className="ml-2 block text-sm text-gray-900">Habilitar OAuth2</label>
                    </div>

                    {config.oauth2_enabled && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="oauth2_provider_url" className="block text-sm font-medium text-gray-700">URL do Provedor OAuth2:</label>
                                <input type="text" name="oauth2_provider_url" id="oauth2_provider_url" value={config.oauth2_provider_url || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: https://accounts.google.com" />
                            </div>
                            <div>
                                <label htmlFor="oauth2_client_id" className="block text-sm font-medium text-gray-700">Client ID:</label>
                                <input type="text" name="oauth2_client_id" id="oauth2_client_id" value={config.oauth2_client_id || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="oauth2_client_secret" className="block text-sm font-medium text-gray-700">Client Secret:</label>
                                <input type="password" name="oauth2_client_secret" id="oauth2_client_secret" value={config.oauth2_client_secret || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="oauth2_scope" className="block text-sm font-medium text-gray-700">Scope:</label>
                                <input type="text" name="oauth2_scope" id="oauth2_scope" value={config.oauth2_scope || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: openid email profile" />
                            </div>
                            <div>
                                <label htmlFor="oauth2_redirect_uri" className="block text-sm font-medium text-gray-700">Redirect URI:</label>
                                <input type="text" name="oauth2_redirect_uri" id="oauth2_redirect_uri" value={config.oauth2_redirect_uri || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: http://localhost:3000/auth/callback" />
                            </div>
                            <div>
                                <label htmlFor="oauth2_userinfo_url" className="block text-sm font-medium text-gray-700">User Info URL:</label>
                                <input type="text" name="oauth2_userinfo_url" id="oauth2_userinfo_url" value={config.oauth2_userinfo_url || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: https://www.googleapis.com/oauth2/v3/userinfo" />
                            </div>
                            <div>
                                <label htmlFor="oauth2_username_attribute" className="block text-sm font-medium text-gray-700">Atributo de Usuário (User Info):</label>
                                <input type="text" name="oauth2_username_attribute" id="oauth2_username_attribute" value={config.oauth2_username_attribute || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: preferred_username" />
                            </div>
                            <div>
                                <label htmlFor="oauth2_email_attribute" className="block text-sm font-medium text-gray-700">Atributo de Email (User Info):</label>
                                <input type="text" name="oauth2_email_attribute" id="oauth2_email_attribute" value={config.oauth2_email_attribute || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: email" />
                            </div>
                            <div>
                                <label htmlFor="oauth2_login_button_text" className="block text-sm font-medium text-gray-700">Texto do Botão de Login OAuth2:</label>
                                <input type="text" name="oauth2_login_button_text" id="oauth2_login_button_text" value={config.oauth2_login_button_text || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: Entrar com Google" />
                            </div>
                        </div>
                    )}
                </fieldset>

                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                >
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </form>
        </div>
    );
};

export default SettingsPage;
