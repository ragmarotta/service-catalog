import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ComputerDesktopIcon } from '@heroicons/react/24/outline';
import apiClient from '../services/api';
import './Header.css';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth();
    const [iconUrl, setIconUrl] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await apiClient.get('/config');
                if (response.data && response.data.icon_url) {
                    setIconUrl(response.data.icon_url);
                }
            } catch (error) {
                console.error("Error fetching app config:", error);
            }
        };
        fetchConfig();
    }, []);

    return (
        <header className="header-container">
            {/* Botão para abrir/fechar sidebar em telas menores ou quando fechada */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="header-sidebar-toggle-button"
            >
                <Bars3Icon className="header-sidebar-toggle-icon" />
            </button>
            
            {/* Ícone da Aplicação */}
            <div className="header-app-icon-container">
                {iconUrl ? (
                    <img src={iconUrl} alt="App Icon" className="header-app-icon" />
                ) : (
                    <ComputerDesktopIcon className="header-app-icon-default"/>
                )}
            </div>

            {/* Espaçador para empurrar o conteúdo para a direita */}
            <div className="header-spacer"></div>

            <div className="header-user-info">
                <span className="header-welcome-text">
                    Bem-vindo, {user?.full_name || user?.username}!
                </span>
                <UserCircleIcon className="header-user-icon"/>
            </div>
        </header>
    );
};

export default Header;
