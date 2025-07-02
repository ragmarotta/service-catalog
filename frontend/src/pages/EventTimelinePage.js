import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { XCircleIcon } from '@heroicons/react/24/solid';

import './EventTimelinePage.css';

const COLOR_PALETTE = [
    'bg-sky-500', 'bg-purple-500', 'bg-amber-500', 'bg-indigo-500', 
    'bg-red-500', 'bg-green-500', 'bg-pink-500', 'bg-teal-500'
];

const EventTimelinePage = () => {
    // Estado para os filtros
    const [selectedResource, setSelectedResource] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEventTypes, setSelectedEventTypes] = useState([]);
    
    // Estado para armazenar dados da API
    const [resources, setResources] = useState([]);
    const [events, setEvents] = useState([]);
    const [availableEventTypes, setAvailableEventTypes] = useState([]);
    
    // Estado de controle da UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [eventTypeColors, setEventTypeColors] = useState({});

    // Fetch resources on component mount
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await apiClient.get('/resources');
                setResources(response.data);
                // Set initial selected resource if available
                setSelectedResource(response.data.length > 0 ? response.data[0].id : '');
            } catch (err) {
                setError('Falha ao carregar a lista de recursos.');
            }
        };
        fetchResources();
    }, []); // Empty dependency array means this runs once on mount

    const fetchTimeline = useCallback(async () => {
        if (!selectedResource) {
            setEvents([]);
            setAvailableEventTypes([]);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', new Date(startDate).toISOString());
            if (endDate) params.append('end_date', new Date(endDate).toISOString());

            const response = await apiClient.get(`/resources/${selectedResource}/timeline?${params.toString()}`);
            setEvents(response.data);

            if (response.data.length > 0) {
                const uniqueTypes = [...new Set(response.data.map(event => event.event_type))].sort();
                setAvailableEventTypes(uniqueTypes);

                const newColors = {};
                uniqueTypes.forEach((type, index) => {
                    newColors[type] = COLOR_PALETTE[index % COLOR_PALETTE.length];
                });
                setEventTypeColors(newColors);

                setSelectedEventTypes(prev => prev.filter(t => uniqueTypes.includes(t)));
            } else {
                setAvailableEventTypes([]);
                setEventTypeColors({});
                setSelectedEventTypes([]);
            }

        } catch (err) {
            setError('Falha ao carregar a timeline de eventos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedResource, startDate, endDate]);

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);
    
    /**
     * Formata uma string de data ISO (que vem da API em UTC) para o fuso horário de São Paulo.
     * @param {string} isoString - A data no formato ISO 8601 (ex: "2023-10-27T18:30:00Z").
     * @returns {string} A data e hora formatadas para pt-BR no fuso de São Paulo.
     */
    const formatDateTime = (isoString) => {
        if (!isoString) return 'Data indisponível';

        try {
            // 1. Cria um objeto Date a partir da string ISO. O JavaScript interpreta
            //    corretamente a string como um momento no tempo universal (UTC).
            const date = new Date(isoString);

            // 2. Define as opções de formatação, especificando o fuso horário alvo.
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'America/Sao_Paulo',
            };

            // 3. Usa a API de Internacionalização para formatar a data, que é mais robusta.
            return new Intl.DateTimeFormat('pt-BR', options).format(date);
        } catch (e) {
            console.error("Erro ao formatar data:", e, "Input:", isoString);
            return 'Data inválida';
        }
    };

    const handleEventTypeClick = (eventType) => {
        setSelectedEventTypes([eventType]);
    };

    const clearEventTypeFilter = () => {
        setSelectedEventTypes([]);
    };

    const filteredEvents = events.filter(event => {
        if (selectedEventTypes.length === 0) {
            return true;
        }
        return selectedEventTypes.includes(event.event_type);
    });

    return (
        <div className="event-timeline-page-container">
            <h1 className="event-timeline-page-title">Timeline de Eventos</h1>
            
            <div className="event-timeline-filters-grid">
                <div>
                    <label htmlFor="resource" className="event-timeline-filter-label">Recurso</label>
                    <select id="resource" value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="event-timeline-filter-select">
                        <option value="" disabled>Selecione um recurso</option>
                        {resources.map(res => <option key={res.id} value={res.id}>{res.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="eventTypes" className="event-timeline-filter-label">Tipos de Evento</label>
                    <select id="eventTypes" value={selectedEventTypes[0] || ''} onChange={e => setSelectedEventTypes(e.target.value ? [e.target.value] : [])} className="event-timeline-filter-select">
                        <option value="">Todos</option>
                        {availableEventTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="startDate" className="event-timeline-filter-label">Data de Início</label>
                    <input type="datetime-local" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="event-timeline-filter-input" />
                </div>
                <div>
                    <label htmlFor="endDate" className="event-timeline-filter-label">Data de Fim</label>
                    <input type="datetime-local" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="event-timeline-filter-input" />
                </div>
                {selectedEventTypes.length > 0 && (
                     <div className="event-timeline-clear-filter-container">
                        <button onClick={clearEventTypeFilter} className="event-timeline-clear-filter-button">
                            <XCircleIcon className="event-timeline-clear-filter-icon"/>
                            Limpar Filtro de Tipos
                        </button>
                    </div>
                )}
                <div className="event-timeline-refresh-button-container">
                    <button onClick={fetchTimeline} className="event-timeline-refresh-button">
                        Atualizar
                    </button>
                </div>
            </div>

            <div className="relative">
                {loading && <p className="event-timeline-loading-message">Carregando eventos...</p>}
                {error && <p className="event-timeline-error-message">{error}</p>}
                {!loading && !error && filteredEvents.length === 0 && (
                    <p className="event-timeline-no-events-message">
                        {selectedResource ? "Nenhum evento encontrado para os filtros selecionados." : "Por favor, selecione um recurso para ver os eventos."}
                    </p>
                )}
                
                {filteredEvents.length > 0 && (
                    <div className="event-timeline-events-list">
                        {filteredEvents.map((event, index) => {
                            const dotColor = eventTypeColors[event.event_type] || 'bg-gray-400';
                            return (
                                <div key={index} className="event-timeline-event-item">
                                    <div className={`event-timeline-event-dot ${dotColor}`}></div>
                                    <p className="event-timeline-event-timestamp">{formatDateTime(event.timestamp)}</p>
                                    <h3 onClick={() => handleEventTypeClick(event.event_type)} className="event-timeline-event-title" title="Filtrar por este tipo de evento">
                                        {event.event_type}
                                    </h3>
                                    {event.message && <p className="event-timeline-event-message">{event.message}</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventTimelinePage;