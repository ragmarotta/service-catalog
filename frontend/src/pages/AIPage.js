import React, { useState } from 'react';
import api from '../services/api';
import './AIPage.css';

const AIPage = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendPrompt = async () => {
        if (!prompt.trim()) return;

        const newMessages = [...messages, { sender: 'user', text: prompt }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await api.post('/ai/analyse', { prompt });
            setMessages([...newMessages, { sender: 'ai', text: response.data.response }]);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Ocorreu um erro ao processar sua solicitação.';
            setMessages([...newMessages, { sender: 'ai', text: errorMessage, isError: true }]);
        }

        setPrompt('');
        setIsLoading(false);
    };

    return (
        <div className="ai-page">
            <h1>Análise por IA</h1>
            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                            <p>{msg.text}</p>
                        </div>
                    ))}
                    {isLoading && <div className="message ai"><p>Pensando...</p></div>}
                </div>
                <div className="chat-input">
                    <input 
                        type="text" 
                        placeholder="Digite sua pergunta..." 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
                        disabled={isLoading}
                    />
                    <button onClick={handleSendPrompt} disabled={isLoading}>
                        {isLoading ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIPage;
