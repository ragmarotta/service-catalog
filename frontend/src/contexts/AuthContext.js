import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Verifica se o token expirou
          if (decoded.exp * 1000 > Date.now()) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Buscar dados do usuário para garantir que a sessão ainda é válida no backend
            const { data } = await apiClient.get('/users/me');
            setUser(data);
            setIsAuthenticated(true);
          } else {
            // Token expirado
            logout();
          }
        } catch (error) {
          console.error("Falha ao inicializar autenticação:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const { data } = await apiClient.post('/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('token', data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      
      const userResponse = await apiClient.get('/users/me');
      setUser(userResponse.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      logout(); // Limpa qualquer estado antigo
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
