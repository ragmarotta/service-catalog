import React from 'react';
import { render, screen } from '@testing-library/react';
import EventTimelinePage from '../pages/EventTimelinePage';
import apiClient from '../services/api';
import { AuthProvider } from '../contexts/AuthContext';

jest.mock('../services/api');

describe('EventTimelinePage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    const renderComponent = () =>
        render(
            <AuthProvider>
                <EventTimelinePage />
            </AuthProvider>
        );

    test('deve formatar a data UTC para o fuso horário de São Paulo', async () => {
        const utcTimestamp = "2023-10-27T18:00:00.000Z"; // 18h em UTC
        const saoPauloTimestamp = "27/10/2023, 15:00:00"; // 15h em GMT-3

        // Mock das respostas da API
        apiClient.get
            .mockResolvedValueOnce({ data: [{ id: '1', name: 'Recurso Teste' }] }) // Para a lista de recursos
            .mockResolvedValueOnce({ data: [{ event_type: 'DEPLOY', timestamp: utcTimestamp, message: 'Teste' }] }); // Para a timeline

        renderComponent();
        
        // Aguarda e verifica se a data formatada corretamente está no documento
        expect(await screen.findByText(saoPauloTimestamp)).toBeInTheDocument();
    });
});
