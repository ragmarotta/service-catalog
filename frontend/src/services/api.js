import axios from 'axios';

// Cria uma instância do Axios
const apiClient = axios.create({
  // A URL base da API é configurada pelo proxy do Nginx no ambiente de produção.
  // Em desenvolvimento, o proxy do Webpack dev server fará o trabalho.
  baseURL: process.env.REACT_APP_API_URL || '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona um interceptor para incluir o token de autenticação em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
