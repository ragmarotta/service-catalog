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
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'administrador';
  const canEdit = isAdmin || user?.role === 'usuario';

  return (
    <aside
      className={`sidebar-container ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo-link">
            <ComputerDesktopIcon className="sidebar-logo-icon"/>
            <span className={`sidebar-logo-text ${!sidebarOpen && 'hidden'}`}>Serviços</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle-button">
            <ChevronDoubleLeftIcon className={`sidebar-toggle-icon ${!sidebarOpen && 'rotate-180'}`} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
        >
          <MapIcon className="sidebar-nav-icon" />
          <span className={`sidebar-nav-text ${!sidebarOpen && 'hidden'}`}>Mapa de Serviços</span>
        </NavLink>

        {/* Adicionado link para a nova página de lista de recursos */}
        <NavLink
            to="/resources"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
        >
            <RectangleStackIcon className="sidebar-nav-icon" />
            <span className={`sidebar-nav-text ${!sidebarOpen && 'hidden'}`}>Recursos</span>
        </NavLink>

        {/* Mantive o link de "Novo Recurso" para acesso rápido */}
        {canEdit && (
            <NavLink
                to="/resources/new"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
            >
                <PlusCircleIcon className="sidebar-nav-icon" />
                <span className={`sidebar-nav-text ${!sidebarOpen && 'hidden'}`}>Novo Recurso</span>
            </NavLink>
        )}
        <NavLink
          to="/timeline"
          className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
        >
          <ClockIcon className="sidebar-nav-icon" />
          <span className={`sidebar-nav-text ${!sidebarOpen && 'hidden'}`}>Timeline de Eventos</span>
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
          >
            <UsersIcon className="sidebar-nav-icon" />
            <span className={`sidebar-nav-text ${!sidebarOpen && 'hidden'}`}>Gerenciar Usuários</span>
          </NavLink>
        )}
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={logout}
          className={`sidebar-nav-link sidebar-logout-button`}
        >
          <ArrowLeftOnRectangleIcon className="sidebar-nav-icon" />
          <span className={`sidebar-nav-text ${!sidebarOpen && 'hidden'}`}>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
