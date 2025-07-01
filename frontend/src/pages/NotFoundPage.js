import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
    return (
        <div className="not-found-container">
            <h1 className="not-found-title">404</h1>
            <h2 className="not-found-subtitle">Página Não Encontrada</h2>
            <p className="not-found-message">
                Desculpe, a página que você está procurando não existe.
            </p>
            <Link
                to="/"
                className="not-found-home-button"
            >
                Voltar para o Início
            </Link>
        </div>
    );
};

export default NotFoundPage;
