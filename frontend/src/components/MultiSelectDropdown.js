import React, { useState, useEffect, useRef } from 'react';
import './MultiSelectDropdown.css';

// --- Componente: Multi-Select Dropdown ---
const MultiSelectDropdown = ({ options, selectedOptions, onChange, placeholder = "Selecione os tipos..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

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
        <div className="multi-select-dropdown-container" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="multi-select-dropdown-button"
            >
                <span className="multi-select-dropdown-button-text">
                    {selectedOptions.length > 0 ? selectedOptions.join(', ') : placeholder}
                </span>
                <span className="multi-select-dropdown-button-icon-wrapper">
                    <svg className="multi-select-dropdown-button-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 7.03 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3z" clipRule="evenodd" transform="rotate(180 10 5.25)" />
                    </svg>
                </span>
            </button>
            {isOpen && (
                <ul className="multi-select-dropdown-options-list">
                    {options.length > 0 ? options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleOptionToggle(option)}
                            className="multi-select-dropdown-option-item"
                        >
                            <span className={`multi-select-dropdown-option-text ${selectedOptions.includes(option) ? 'multi-select-dropdown-option-text-selected' : 'multi-select-dropdown-option-text-normal'}`}>{option}</span>
                            {selectedOptions.includes(option) && (
                                <span className="multi-select-dropdown-option-check-icon-wrapper">
                                    <svg className="multi-select-dropdown-option-check-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                </span>
                            )}
                        </li>
                    )) : <li className="multi-select-dropdown-no-options">Nenhum tipo de evento encontrado.</li>}
                </ul>
            )}
        </div>
    );
};

export default MultiSelectDropdown;