import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import './CustomEdge.css';

/**
 * Componente customizado para renderizar uma aresta (relação) com um botão de exclusão.
 */
function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data, // Dados passados para a aresta, incluindo a função de exclusão.
}) {
  // Calcula o caminho da aresta
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Função chamada ao clicar no botão de exclusão
  const onEdgeClick = (evt) => {
    evt.stopPropagation(); // Impede que o clique se propague para outros elementos
    data.onDelete(id); // Chama a função de exclusão passada como propriedade
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="custom-edge-button-wrapper"
        >
          <button
            className="custom-edge-delete-button"
            onClick={onEdgeClick}
            title="Excluir Relação"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default CustomEdge;
