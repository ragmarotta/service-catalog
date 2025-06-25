import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

// --- Componente: VisualMap ---
// Responsável por toda a renderização e interação do diagrama de fluxo.
const VisualMap = ({ nodes, edges, onNodesChange, onEdgesChange, onNodeClick, onPaneClick, onNodeContextMenu, selectedNode }) => {
  return (
    <>
      <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border text-xs">
          <div className="font-bold mb-2 text-gray-700">Legenda</div>
          <div className="flex items-center gap-2"><ArrowUpIcon className="w-4 h-4 text-green-500"/><span className="text-gray-600">Depende de (Pais)</span></div>
          <div className="flex items-center gap-2 mt-1"><ArrowDownIcon className="w-4 h-4 text-red-500"/><span className="text-gray-600">Impacta (Filhos)</span></div>
      </div>

      <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu} // Propriedade corrigida/adicionada
          fitView
          className="bg-gray-50"
      >
          <MiniMap />
          <Controls />
          <Background />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute p-4 m-4 bg-white rounded-lg shadow-xl top-0 right-0 max-w-sm z-10 border">
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