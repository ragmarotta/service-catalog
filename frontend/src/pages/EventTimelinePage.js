import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

const EventTimelinePage = () => {
    // Estado para os filtros
    const [selectedResource, setSelectedResource] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Estado para armazenar dados da API
    const [resources, setResources] = useState([]);
    const [events, setEvents] = useState([]);
    
    // Estado de controle da UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Busca a lista de todos os recursos para preencher o seletor
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await apiClient.get('/resources');
                setResources(response.data);
                // Seleciona o primeiro recurso da lista por padrão, se houver
                if (response.data.length > 0) {
                    setSelectedResource(response.data[0].id);
                }
            } catch (err) {
                setError('Falha ao carregar a lista de recursos.');
            }
        };
        fetchResources();
    }, []);

    // Função para buscar a timeline de eventos com base nos filtros
    const fetchTimeline = useCallback(async () => {
        // Não busca se nenhum recurso estiver selecionado
        if (!selectedResource) {
            setEvents([]);
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Constrói os parâmetros da query string
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', new Date(startDate).toISOString());
            if (endDate) params.append('end_date', new Date(endDate).toISOString());

            const response = await apiClient.get(`/resources/${selectedResource}/timeline?${params.toString()}`);
            setEvents(response.data);
        } catch (err) {
            setError('Falha ao carregar a timeline de eventos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedResource, startDate, endDate]);

    // Efeito que chama a busca da timeline sempre que um filtro muda
    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);
    
    // Formata a data e hora para exibição
    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Timeline de Eventos</h1>
            
            {/* Formulário de Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border rounded-md">
                <div>
                    <label htmlFor="resource" className="block text-sm font-medium text-gray-700">Recurso (Obrigatório)</label>
                    <select id="resource" value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                        <option value="" disabled>Selecione um recurso</option>
                        {resources.map(res => (
                            <option key={res.id} value={res.id}>{res.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
                    <input type="datetime-local" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
                    <input type="datetime-local" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>

            {/* Exibição da Timeline */}
            <div className="relative">
                {loading && <p>Carregando eventos...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && events.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                        {selectedResource ? "Nenhum evento encontrado para o período e recurso selecionados." : "Por favor, selecione um recurso para ver os eventos."}
                    </p>
                )}
                
                {/* Linha da timeline */}
                {events.length > 0 && (
                    <div className="border-l-2 border-indigo-200 ml-6">
                        {events.map((event, index) => (
                            <div key={index} className="relative mb-8 pl-12">
                                {/* Ponto na linha do tempo */}
                                <div className="absolute -left-2.5 top-1.5 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white"></div>
                                
                                <p className="text-sm text-gray-500">{formatDateTime(event.timestamp)}</p>
                                <h3 className="text-lg font-semibold text-gray-800">{event.event_type}</h3>
                                {event.message && <p className="text-gray-600 mt-1">{event.message}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventTimelinePage;
