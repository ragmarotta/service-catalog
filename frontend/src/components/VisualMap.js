import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowUpIcon, ArrowDownIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';

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
      <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border text-xs">
          <div className="font-bold mb-2 text-gray-700">Legenda</div>
          <div className="flex items-center gap-2"><ArrowUpIcon className="w-4 h-4 text-green-500"/><span className="text-gray-600">Depende de (Pais)</span></div>
          <div className="flex items-center gap-2 mt-1"><ArrowDownIcon className="w-4 h-4 text-red-500"/><span className="text-gray-600">Impacta (Filhos)</span></div>
      </div>
      
      {/* NOVO: Botão de Maximizar/Minimizar */}
      <div className="absolute top-4 right-4 z-10">
          <button 
              onClick={onToggleMaximize}
              className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg border text-gray-600 hover:text-indigo-600 transition-colors"
              title={isMaximized ? "Restaurar Visualização" : "Maximizar Visualização"}
          >
              {isMaximized ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
              ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
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
          className="bg-gray-50"
      >
          <MiniMap />
          <Controls />
          <Background />
      </ReactFlow>

      {/* Painel de Informações do Nó Selecionado */}
      {selectedNode && (
        <div className="absolute p-4 m-4 bg-white rounded-lg shadow-xl top-0 right-0 max-w-sm z-20 border">
            <button onClick={() => onPaneClick()} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
            <h3 className="text-lg font-bold text-indigo-700">{selectedNode.data.label}</h3>
            <p className="mt-2 text-sm text-gray-600">{selectedNode.data.description || 'Sem descrição.'}</p>
            <div className="mt-4">
                <h4 className="font-semibold text-gray-800">Tags:</h4>
                {selectedNode.data.tags?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">{selectedNode.data.tags.map((tag, index) => (<span key={index} className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{tag.key}: {tag.value}</span>))}</div>
                ) : (<p className='text-sm text-gray-500'>Nenhuma tag definida.</p>)}
            </div>
        </div>
      )}
    </>
  );
};

export default VisualMap;
