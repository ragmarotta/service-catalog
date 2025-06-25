import React, { useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/solid';

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
        <div className="w-full h-full bg-gray-900 flex flex-col">
            <div className="flex justify-end p-2 bg-gray-800">
                <button onClick={handleCopyToClipboard} className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>{copySuccess || 'Copiar'}</span>
                </button>
            </div>
            <div className="w-full h-full overflow-auto p-4">
                <pre><code className="text-gray-300 text-sm">{dotScript}</code></pre>
            </div>
        </div>
    );
};

export default DotLanguageViewer;
