import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa os estilos do Tailwind CSS
import App from './App'; // Importa o componente principal da aplicação

// Encontra o elemento 'root' no seu HTML (em public/index.html)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza o componente App dentro do elemento 'root'
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
