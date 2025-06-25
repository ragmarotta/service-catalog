import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResourceListPage from '../pages/ResourceListPage';
import apiClient from '../services/api';
import { AuthProvider } from '../contexts/AuthContext';

// Diz ao Jest para usar o nosso mock manual de axios.
jest.mock('../services/api');

// Dados mockados para serem usados nos testes.
const mockResources = [
    { id: '1', name: 'API Principal', description: 'Serviço core', tags: [{key: 'env', value: 'prod'}], parents: [], children: ['Serviço de Cache'] },
    { id: '2', name: 'Serviço de Cache', description: 'Cache Redis', tags: [], parents: ['API Principal'], children: [] },
];

describe('ResourceListPage', () => {
    // Esta função é executada antes de cada teste, garantindo um ambiente limpo.
    beforeEach(() => {
        // Reseta todos os mocks, incluindo implementações e histórico de chamadas.
        jest.resetAllMocks();
    });

    // Função de helper para renderizar o componente com todos os providers necessários.
    const renderComponent = () =>
        render(
            <AuthProvider>
                <BrowserRouter>
                    <ResourceListPage />
                </BrowserRouter>
            </AuthProvider>
        );

    test('deve renderizar a lista de recursos corretamente', async () => {
        // Configura o mock especificamente para este teste.
        apiClient.get.mockResolvedValue({ data: mockResources });
        
        renderComponent();

        // Verifica se a API foi chamada.
        expect(apiClient.get).toHaveBeenCalledWith('/resources?');

        // Aguarda o componente re-renderizar com os dados e afirma que os nomes estão no ecrã.
        expect(await screen.findByText('API Principal')).toBeInTheDocument();
        expect(screen.getByText('Serviço de Cache')).toBeInTheDocument();
    });

    test('deve exibir uma mensagem de erro em caso de falha da API', async () => {
        // Configura o mock para simular um erro para este teste.
        apiClient.get.mockRejectedValue(new Error('API Failure'));
        
        renderComponent();
        
        // Aguarda a mensagem de erro ser exibida.
        expect(await screen.findByText('Falha ao carregar recursos.')).toBeInTheDocument();
    });

    test('deve filtrar os recursos quando o formulário é submetido', async () => {
        // Mock da chamada inicial da API (sem filtros).
        apiClient.get.mockResolvedValueOnce({ data: mockResources });
        
        renderComponent();
        
        // Aguarda a lista inicial ser renderizada.
        await screen.findByText('API Principal');

        // Simula o utilizador a escrever no campo de filtro de nome.
        const nameInput = screen.getByLabelText(/Nome/i);
        fireEvent.change(nameInput, { target: { value: 'Cache' } });

        // Configura o mock para a segunda chamada da API (com filtro).
        const filteredMock = [mockResources[1]]; // Apenas o serviço de cache
        apiClient.get.mockResolvedValueOnce({ data: filteredMock });

        // Simula o clique no botão de filtrar.
        const filterButton = screen.getByRole('button', { name: /Filtrar/i });
        fireEvent.click(filterButton);

        // Aguarda a UI atualizar.
        await waitFor(() => {
            // Afirma que a API foi chamada uma segunda vez com o parâmetro de filtro correto.
            expect(apiClient.get).toHaveBeenCalledWith('/resources?name=Cache');
            // Afirma que o item que deveria ter sido filtrado não está mais visível.
            expect(screen.queryByText('API Principal')).not.toBeInTheDocument();
            // Afirma que o item filtrado ainda está visível.
            expect(screen.getByText('Serviço de Cache')).toBeInTheDocument();
        });
    });
});
