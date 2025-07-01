import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowUpIcon, ArrowDownIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';
import './VisualMap.css';

/**
 * Componente especializado para renderizar o diagrama de fluxo interativo.
 *
 * @param {object} props - Propriedades do componente.
 * @param {Array} props.nodes - Lista de nós para o ReactFlow.
 * @param {Array} props.edges - Lista de arestas para o ReactFlow.
 * @param {function} props.onNodesChange - Callback para mudanças nos nós.
 * @param {function} props.onEdgesChange - Callback para mudanças nas arestas.
 * @param {function} props.onNodeClick - Callback para o clique esquerdo num nó.
 * @param {function} props.onPaneClick - Callback para o clique no fundo do mapa.
 * @param {function} props.onNodeContextMenu - Callback para o clique direito num nó.
 * @param {function} props.onConnect - Callback para a criação de novas ligações.
 * @param {object} props.nodeTypes - Tipos de nós customizados.
 * @param {object} props.edgeTypes - Tipos de arestas customizadas.
 * @param {object|null} props.selectedNode - O nó atualmente selecionado.
 * @param {boolean} props.isMaximized - Estado que indica se o mapa está maximizado.
 * @param {function} props.onToggleMaximize - Callback para alternar o modo de ecrã inteiro.
 */
const VisualMap = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onPaneClick,
  onNodeContextMenu,
  onConnect,
  nodeTypes,
  edgeTypes,
  selectedNode,
  isMaximized,
  onToggleMaximize
}) => {
  return (
    <>
      {/* Legenda de Cores */}
      <div className="visual-map-legend">
          <div className="visual-map-legend-title">Legenda</div>
          <div className="visual-map-legend-item"><ArrowUpIcon className="visual-map-legend-icon-up"/><span className="visual-map-legend-text">Depende de (Pais)</span></div>
          <div className="visual-map-legend-item mt-1"><ArrowDownIcon className="visual-map-legend-icon-down"/><span className="visual-map-legend-text">Impacta (Filhos)</span></div>
      </div>
      
      {/* NOVO: Botão de Maximizar/Minimizar */}
      <div className="visual-map-maximize-button-wrapper">
          <button 
              onClick={onToggleMaximize}
              className="visual-map-maximize-button"
              title={isMaximized ? "Restaurar Visualização" : "Maximizar Visualização"}
          >
              {isMaximized ? (
                  <ArrowsPointingInIcon className="visual-map-maximize-icon" />
              ) : (
                  <ArrowsPointingOutIcon className="visual-map-maximize-icon" />
              )}
          </button>
      </div>

      <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="visual-map-react-flow"
      >
          <MiniMap />
          <Controls />
          <Background />
      </ReactFlow>

      {/* Painel de Informações do Nó Selecionado */}
      {selectedNode && (
        <div className="visual-map-selected-node-panel">
            <button onClick={() => onPaneClick()} className="visual-map-selected-node-close-button">&times;</button>
            <h3 className="visual-map-selected-node-title">{selectedNode.data.label}</h3>
            <p className="visual-map-selected-node-description">{selectedNode.data.description || 'Sem descrição.'}</p>
            <div className="visual-map-selected-node-tags-section">
                <h4 className="visual-map-selected-node-tags-title">Tags:</h4>
                {selectedNode.data.tags?.length > 0 ? (
                    <div className="visual-map-selected-node-tags-list">{selectedNode.data.tags.map((tag, index) => (<span key={index} className="visual-map-selected-node-tag">{tag.key}: {tag.value}</span>))}</div>
                ) : (<p className='visual-map-selected-node-no-tags'>Nenhuma tag definida.</p>)}
            </div>
        </div>
      )}
    </>
  );
};

export default VisualMap;
