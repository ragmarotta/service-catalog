import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNode.css';

/**
 * Componente customizado para renderizar um nó (recurso) no mapa de serviços.
 * Adiciona "handles" (pontos de conexão) na parte superior e inferior.
 * @param {object} data - Os dados do nó, incluindo o seu nome (label).
 */
const CustomNode = ({ data }) => {
  return (
    <div className="custom-node-container">
      {/* Handle Superior: Ponto de entrada para ser um "filho" */}
      <Handle
        type="target"
        position={Position.Top}
        className="custom-node-handle-top"
        id="top"
      />
      
      {/* Conteúdo do Nó */}
      <div className="custom-node-label">{data.label}</div>

      {/* Handle Inferior: Ponto de saída para ser um "pai" */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="custom-node-handle-bottom"
        id="bottom"
      />
    </div>
  );
};

// Usa memo para otimizar a performance, evitando re-renderizações desnecessárias.
export default memo(CustomNode);
