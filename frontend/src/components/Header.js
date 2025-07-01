import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import './Header.css';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth();

    return (
        <header className="header-container">
            {/* Botão para abrir/fechar sidebar em telas menores ou quando fechada */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="header-sidebar-toggle-button"
            >
                <Bars3Icon className="header-sidebar-toggle-icon" />
            </button>
            
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
