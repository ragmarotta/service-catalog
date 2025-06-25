import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MapIcon,
  PlusCircleIcon,
  ClockIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ComputerDesktopIcon,
  RectangleStackIcon // Ícone para a lista de recursos
} from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'administrador';
  const canEdit = isAdmin || user?.role === 'usuario';

  const baseLinkClasses = "flex items-center px-4 py-3 text-gray-300 transition-colors duration-200 transform rounded-md hover:bg-gray-700 hover:text-white";
  const activeLinkClasses = "bg-gray-700 text-white";

  return (
    <aside
      className={`z-30 flex flex-col flex-shrink-0 text-white bg-gray-800 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <Link to="/" className="flex items-center">
            <ComputerDesktopIcon className="w-8 h-8 text-indigo-400"/>
            <span className={`ml-3 text-xl font-semibold ${!sidebarOpen && 'hidden'}`}>Serviços</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-full hover:bg-gray-700 focus:outline-none">
            <ChevronDoubleLeftIcon className={`w-6 h-6 transition-transform duration-300 ${!sidebarOpen && 'rotate-180'}`} />
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
          <MapIcon className="w-6 h-6" />
          <span className={`mx-4 font-medium ${!sidebarOpen && 'hidden'}`}>Mapa de Serviços</span>
        </NavLink>

        {/* Adicionado link para a nova página de lista de recursos */}
        <NavLink
            to="/resources"
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
            <RectangleStackIcon className="w-6 h-6" />
            <span className={`mx-4 font-medium ${!sidebarOpen && 'hidden'}`}>Recursos</span>
        </NavLink>

        {/* Mantive o link de "Novo Recurso" para acesso rápido */}
        {canEdit && (
            <NavLink
                to="/resources/new"
                className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
                <PlusCircleIcon className="w-6 h-6" />
                <span className={`mx-4 font-medium ${!sidebarOpen && 'hidden'}`}>Novo Recurso</span>
            </NavLink>
        )}
        <NavLink
          to="/timeline"
          className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
          <ClockIcon className="w-6 h-6" />
          <span className={`mx-4 font-medium ${!sidebarOpen && 'hidden'}`}>Timeline de Eventos</span>
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <UsersIcon className="w-6 h-6" />
            <span className={`mx-4 font-medium ${!sidebarOpen && 'hidden'}`}>Gerenciar Usuários</span>
          </NavLink>
        )}
      </nav>
      <div className="px-2 py-4 mt-auto border-t border-gray-700">
        <button
          onClick={logout}
          className={`${baseLinkClasses} w-full`}
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          <span className={`mx-4 font-medium ${!sidebarOpen && 'hidden'}`}>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
