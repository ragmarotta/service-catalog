import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
            {/* Botão para abrir/fechar sidebar em telas menores ou quando fechada */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 focus:outline-none lg:hidden"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>
            
            {/* Espaçador para empurrar o conteúdo para a direita */}
            <div className="flex-1"></div>

            <div className="flex items-center">
                <span className="hidden mr-4 text-sm font-medium text-gray-700 sm:block">
                    Bem-vindo, {user?.full_name || user?.username}!
                </span>
                <UserCircleIcon className="w-8 h-8 text-gray-400"/>
            </div>
        </header>
    );
};

export default Header;
