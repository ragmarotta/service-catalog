import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
            <h1 className="text-6xl font-bold text-indigo-600">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mt-4">Página Não Encontrada</h2>
            <p className="text-gray-600 mt-2">
                Desculpe, a página que você está procurando não existe.
            </p>
            <Link
                to="/"
                className="mt-8 px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
                Voltar para o Início
            </Link>
        </div>
    );
};

export default NotFoundPage;
