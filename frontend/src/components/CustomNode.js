import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * Componente customizado para renderizar um nó (recurso) no mapa de serviços.
 * Adiciona "handles" (pontos de conexão) na parte superior e inferior.
 * @param {object} data - Os dados do nó, incluindo o seu nome (label).
 */
const CustomNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      {/* Handle Superior: Ponto de entrada para ser um "filho" */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
        id="top"
      />
      
      {/* Conteúdo do Nó */}
      <div className="text-center font-bold">{data.label}</div>

      {/* Handle Inferior: Ponto de saída para ser um "pai" */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-orange-500"
        id="bottom"
      />
    </div>
  );
};

// Usa memo para otimizar a performance, evitando re-renderizações desnecessárias.
export default memo(CustomNode);
