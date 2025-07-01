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

    test('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText('Timeline de Eventos')).toBeInTheDocument();
    });
});