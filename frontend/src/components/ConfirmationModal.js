import React from 'react';
import Modal from './Modal'; // Reutiliza o componente base de Modal
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import './ConfirmationModal.css';

// Modal específico para diálogos de confirmação (ex: deletar)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="confirmation-modal-container">
            <div className="confirmation-modal-icon-wrapper">
                <ExclamationTriangleIcon className="confirmation-modal-icon" aria-hidden="true" />
            </div>
            <div className="confirmation-modal-text-container">
                <p className="confirmation-modal-message">{message}</p>
            </div>
        </div>
        <div className="confirmation-modal-actions">
            <button
                type="button"
                className="confirmation-modal-confirm-button"
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
            >
                Confirmar
            </button>
            <button
                type="button"
                className="confirmation-modal-cancel-button"
                onClick={onClose}
            >
                Cancelar
            </button>
        </div>
    </Modal>
  );
};

export default ConfirmationModal;
