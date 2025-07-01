import React from 'react';
import { ArrowsPointingOutIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/solid';
import './NodeContextMenu.css';

/**
 * Renderiza um menu de contexto que aparece com o clique direito num nó.
 * @param {object} props - Propriedades do componente.
 * @param {number} props.top - Posição vertical do menu.
 * @param {number} props.left - Posição horizontal do menu.
 * @param {function} props.onFilterParents - Callback para filtrar pelos pais.
 * @param {function} props.onFilterChildren - Callback para filtrar pelos filhos.
 * @param {function} props.onResetFilter - Callback para limpar o filtro.
 */
const NodeContextMenu = ({ top, left, onFilterParents, onFilterChildren, onResetFilter }) => {
  return (
    <div style={{ top, left }} className="node-context-menu-container" >
      <div className="node-context-menu-item-wrapper">
        <button onClick={onFilterParents} className="node-context-menu-button"><EyeIcon className="node-context-menu-icon node-context-menu-icon-green" /><span>Mostrar Dependentes (Pais)</span></button>
        <button onClick={onFilterChildren} className="node-context-menu-button"><FunnelIcon className="node-context-menu-icon node-context-menu-icon-red" /><span>Mostrar Impactados (Filhos)</span></button>
        <div className="node-context-menu-divider"></div>
        <button onClick={onResetFilter} className="node-context-menu-button"><ArrowsPointingOutIcon className="node-context-menu-icon node-context-menu-icon-gray" /><span>Limpar Filtro</span></button>
      </div>
    </div>
  );
};

export default NodeContextMenu;