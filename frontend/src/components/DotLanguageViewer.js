import React, { useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import './DotLanguageViewer.css';

// --- Componente: DotLanguageViewer ---
// Responsável por exibir o script DOT e a funcionalidade de cópia.
const DotLanguageViewer = ({ dotScript }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopyToClipboard = () => {
        const textArea = document.createElement('textarea');
        textArea.value = dotScript;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopySuccess('Copiado!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Falha ao copiar.');
            console.error('Falha ao copiar script DOT:', err);
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="dot-viewer-container">
            <div className="dot-viewer-header">
                <button onClick={handleCopyToClipboard} className="dot-viewer-copy-button">
                    <ClipboardDocumentIcon className="dot-viewer-copy-icon" />
                    <span>{copySuccess || 'Copiar'}</span>
                </button>
            </div>
            <div className="dot-viewer-content">
                <pre><code className="dot-viewer-code">{dotScript}</code></pre>
            </div>
        </div>
    );
};

export default DotLanguageViewer;
