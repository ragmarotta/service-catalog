import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import ServiceMapPage from './pages/ServiceMapPage';
import ResourceListPage from './pages/ResourceListPage'; // Importar a nova página
import ResourcePage from './pages/ResourcePage';
import UserManagementPage from './pages/UserManagementPage';
import EventTimelinePage from './pages/EventTimelinePage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import AIPage from './pages/AIPage';

// Componente para proteger rotas que exigem autenticação
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Componente para proteger rotas que exigem papel de administrador
function AdminRoute({ children }) {
    const { user } = useAuth();
    // Verifica se o usuário está autenticado e tem o papel de administrador
    return user && user.role === 'administrador' ? children : <Navigate to="/" />;
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas dentro do Layout do Dashboard */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* A rota index define o componente padrão para a rota pai "/" */}
            <Route index element={<ServiceMapPage />} />
            {/* Adicionada a rota para a lista de recursos */}
            <Route path="resources" element={<ResourceListPage />} />
            <Route path="resources/new" element={<ResourcePage />} />
            <Route path="resources/edit/:id" element={<ResourcePage />} />
            <Route path="timeline" element={<EventTimelinePage />} />
            <Route path="ai" element={<AIPage />} />

            {/* Rota de administração de usuários */}
            <Route 
              path="admin/users" 
              element={
                <AdminRoute>
                  <UserManagementPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="settings" 
              element={
                <AdminRoute>
                  <SettingsPage />
                </AdminRoute>
              } 
            />
          </Route>

          {/* Rota para páginas não encontradas */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
