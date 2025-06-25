import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/api';
import { XCircleIcon } from '@heroicons/react/24/solid';

// --- Componente: Multi-Select Dropdown ---
// Um seletor customizado para filtrar múltiplos tipos de eventos.
const MultiSelectDropdown = ({ options, selectedOptions, onChange, placeholder = "Selecione os tipos..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Fecha o dropdown se o utilizador clicar fora dele.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionToggle = (option) => {
        if (selectedOptions.includes(option)) {
            onChange(selectedOptions.filter(item => item !== option));
        } else {
            onChange([...selectedOptions, option]);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            >
                <span className="block truncate">
                    {selectedOptions.length > 0 ? selectedOptions.join(', ') : placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 7.03 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3z" clipRule="evenodd" transform="rotate(180 10 5.25)" />
                    </svg>
                </span>
            </button>
            {isOpen && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {options.length > 0 ? options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleOptionToggle(option)}
                            className="relative cursor-default select-none py-2 pl-8 pr-4 text-gray-900 hover:bg-indigo-600 hover:text-white"
                        >
                            <span className={`block truncate ${selectedOptions.includes(option) ? 'font-semibold' : 'font-normal'}`}>{option}</span>
                            {selectedOptions.includes(option) && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                </span>
                            )}
                        </li>
                    )) : <li className="px-4 py-2 text-gray-500">Nenhum tipo de evento encontrado.</li>}
                </ul>
            )}
        </div>
    );
};

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

    // Estado para as cores geradas dinamicamente
    const [eventTypeColors, setEventTypeColors] = useState({});

    // Paleta de cores para ser usada na geração dinâmica
    const COLOR_PALETTE = [
        'bg-sky-500', 'bg-purple-500', 'bg-amber-500', 'bg-indigo-500', 
        'bg-red-500', 'bg-green-500', 'bg-pink-500', 'bg-teal-500'
    ];
    
    // Busca a lista de recursos disponíveis ao carregar a página
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await apiClient.get('/resources');
                setResources(response.data);
                if (response.data.length > 0) {
                    setSelectedResource(response.data[0].id);
                }
            } catch (err) {
                setError('Falha ao carregar a lista de recursos.');
            }
        };
        fetchResources();
    }, []);

    // Função para buscar a timeline de eventos e gerar os tipos e cores dinamicamente
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

            // Gera os tipos de evento e as cores dinamicamente a partir da resposta
            if (response.data.length > 0) {
                const uniqueTypes = [...new Set(response.data.map(event => event.event_type))].sort();
                setAvailableEventTypes(uniqueTypes);

                const newColors = {};
                uniqueTypes.forEach((type, index) => {
                    newColors[type] = COLOR_PALETTE[index % COLOR_PALETTE.length];
                });
                setEventTypeColors(newColors);

                // Garante que os tipos de evento selecionados ainda sejam válidos
                setSelectedEventTypes(prev => prev.filter(t => uniqueTypes.includes(t)));
            } else {
                // Se não houver eventos, limpa as listas
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
    
    const formatDateTime = (isoString) => {
        if (!isoString) return 'Data indisponível';
        try {
            const date = new Date(isoString);
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false, timeZone: 'America/Sao_Paulo',
            }).format(date);
        } catch (e) {
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
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Timeline de Eventos</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-4 border rounded-md">
                <div>
                    <label htmlFor="resource" className="block text-sm font-medium text-gray-700">Recurso</label>
                    <select id="resource" value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                        <option value="" disabled>Selecione um recurso</option>
                        {resources.map(res => <option key={res.id} value={res.id}>{res.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="eventTypes" className="block text-sm font-medium text-gray-700">Tipos de Evento</label>
                    <MultiSelectDropdown 
                        options={availableEventTypes}
                        selectedOptions={selectedEventTypes}
                        onChange={setSelectedEventTypes}
                    />
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
                    <input type="datetime-local" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
                    <input type="datetime-local" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                {selectedEventTypes.length > 0 && (
                     <div className="col-span-full flex justify-end">
                        <button onClick={clearEventTypeFilter} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
                            <XCircleIcon className="w-4 h-4"/>
                            Limpar Filtro de Tipos
                        </button>
                    </div>
                )}
            </div>

            <div className="relative">
                {loading && <p>Carregando eventos...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && filteredEvents.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                        {selectedResource ? "Nenhum evento encontrado para os filtros selecionados." : "Por favor, selecione um recurso para ver os eventos."}
                    </p>
                )}
                
                {filteredEvents.length > 0 && (
                    <div className="border-l-2 border-indigo-200 ml-6">
                        {filteredEvents.map((event, index) => {
                            const dotColor = eventTypeColors[event.event_type] || 'bg-gray-400';
                            return (
                                <div key={index} className="relative mb-8 pl-12">
                                    <div className={`absolute -left-2.5 top-1.5 w-5 h-5 ${dotColor} rounded-full border-4 border-white`}></div>
                                    <p className="text-sm text-gray-500">{formatDateTime(event.timestamp)}</p>
                                    <h3 onClick={() => handleEventTypeClick(event.event_type)} className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors" title="Filtrar por este tipo de evento">
                                        {event.event_type}
                                    </h3>
                                    {event.message && <p className="text-gray-600 mt-1">{event.message}</p>}
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
