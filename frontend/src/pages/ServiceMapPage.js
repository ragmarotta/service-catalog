import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import apiClient from '../services/api';
import dagre from 'dagre';

// Importa os componentes componentizados
import VisualMap from '../components/VisualMap';
import DotLanguageViewer from '../components/DotLanguageViewer';
import { ArrowsPointingOutIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/solid';

// --- Componente: Menu de Contexto ---
const NodeContextMenu = ({ top, left, onFilterParents, onFilterChildren, onResetFilter }) => {
  return (
    <div style={{ top, left }} className="absolute z-50 bg-white rounded-md shadow-lg border text-sm" >
      <div className="py-1">
        <button onClick={onFilterParents} className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left">
            <EyeIcon className="w-4 h-4 text-green-500" />
            <span>Mostrar Dependentes (Pais)</span>
        </button>
        <button onClick={onFilterChildren} className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left">
            <FunnelIcon className="w-4 h-4 text-red-500" />
            <span>Mostrar Impactados (Filhos)</span>
        </button>
        <div className="border-t my-1"></div>
        <button onClick={onResetFilter} className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left">
            <ArrowsPointingOutIcon className="w-4 h-4 text-gray-500" />
            <span>Limpar Filtro</span>
        </button>
      </div>
    </div>
  );
};


// --- Componente Principal: ServiceMapPage (Contêiner) ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 50;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? 'left' : 'top';
    node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';
    node.position = { x: nodeWithPosition.x - nodeWidth / 2, y: nodeWithPosition.y - nodeHeight / 2 };
  });
  return { nodes, edges };
};

const ServiceMapPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // Estados para guardar a visualização original completa
  const [originalNodes, setOriginalNodes] = useState([]);
  const [originalEdges, setOriginalEdges] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ name: '', tags: '' });
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [dotScript, setDotScript] = useState('');
  
  // Estado para o menu de contexto
  const [contextMenu, setContextMenu] = useState(null);
  const mapRef = useRef(null);


  const generateDotScript = (nodesToConvert, edgesToConvert) => {
    let script = 'digraph Services {\n';
    script += '  rankdir="TB";\n  node [shape=box, style=rounded, fontname="Inter"];\n  edge [fontname="Inter"];\n\n';
    nodesToConvert.forEach(node => {
        const label = node.data.label.replace(/"/g, '\\"');
        script += `  "${node.id}" [label="${label}"];\n`;
    });
    script += '\n';
    edgesToConvert.forEach(edge => {
        script += `  "${edge.source}" -> "${edge.target}";\n`;
    });
    script += '}';
    return script;
  };

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.tags) params.append('tags', filters.tags);
      const { data } = await apiClient.get(`/resources/map?${params.toString()}`);
      
      if (!data || !data.nodes || !data.nodes.length === 0) {
        setNodes([]); setEdges([]); setOriginalNodes([]); setOriginalEdges([]); setDotScript('');
        setError("Nenhum recurso encontrado com os filtros aplicados.");
      } else {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(data.nodes, data.edges);
        const styledEdges = layoutedEdges.map(edge => ({ ...edge, markerEnd: { type: 'ArrowClosed', color: '#6b7280' }, style: { stroke: '#6b7280' } }));
        setNodes(layoutedNodes);
        setEdges(styledEdges);
        setOriginalNodes(layoutedNodes); // Guarda o estado original
        setOriginalEdges(styledEdges);   // Guarda o estado original
        setDotScript(generateDotScript(data.nodes, data.edges));
      }
    } catch (err) {
      setError('Falha ao carregar o mapa de serviços.');
      console.error(err);
      setNodes([]); setEdges([]);
    } finally {
      setLoading(false);
    }
  }, [filters, setNodes, setEdges]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchMapData();
  };

  const getAncestors = useCallback((nodeId, allEdges) => {
    const ancestors = new Set();
    const queue = [nodeId];
    while(queue.length > 0) {
        const currentNodeId = queue.shift();
        allEdges.forEach(edge => {
            if (edge.target === currentNodeId && !ancestors.has(edge.source)) {
                ancestors.add(edge.source);
                queue.push(edge.source);
            }
        });
    }
    return ancestors;
  }, []);

  const getDescendants = useCallback((nodeId, allEdges) => {
    const descendants = new Set();
    const queue = [nodeId];
    while(queue.length > 0) {
        const currentNodeId = queue.shift();
        allEdges.forEach(edge => {
            if (edge.source === currentNodeId && !descendants.has(edge.target)) {
                descendants.add(edge.target);
                queue.push(edge.target);
            }
        });
    }
    return descendants;
  }, []);

  const onNodeClick = useCallback((event, clickedNode) => {
    setContextMenu(null); // Fecha o menu de contexto ao clicar normalmente
    setSelectedNode(clickedNode);
    const ancestors = getAncestors(clickedNode.id, originalEdges);
    const descendants = getDescendants(clickedNode.id, originalEdges);
    setEdges(currentEdges =>
      currentEdges.map(edge => {
        const isAncestorEdge = ancestors.has(edge.source) && (ancestors.has(edge.target) || edge.target === clickedNode.id);
        const isDescendantEdge = descendants.has(edge.target) && (descendants.has(edge.source) || edge.source === clickedNode.id);
        if (isDescendantEdge) return { ...edge, animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { ...edge.markerEnd, color: '#ef4444' } };
        if (isAncestorEdge) return { ...edge, animated: true, style: { stroke: '#22c55e', strokeWidth: 2 }, markerEnd: { ...edge.markerEnd, color: '#22c55e' } };
        return { ...edge, animated: false, style: { stroke: '#d1d5db' }, markerEnd: { ...edge.markerEnd, color: '#d1d5db' } };
      })
    );
  }, [getAncestors, getDescendants, originalEdges, setEdges]);
  
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setContextMenu(null);
    setEdges(originalEdges);
  }, [setEdges, originalEdges]);
  
  const onNodeContextMenu = useCallback((event, node) => {
      event.preventDefault();
      const pane = mapRef.current.getBoundingClientRect();
      setContextMenu({
          id: node.id,
          top: event.clientY - pane.top,
          left: event.clientX - pane.left,
      });
  }, []);

  const filterNodesAndEdges = (nodeIdsToKeep) => {
    setNodes(originalNodes.filter(n => nodeIdsToKeep.has(n.id)));
    setEdges(originalEdges.filter(e => nodeIdsToKeep.has(e.source) && nodeIdsToKeep.has(e.target)));
    setContextMenu(null);
  };

  const handleFilterParents = () => {
    if (!contextMenu) return;
    const parentIds = getAncestors(contextMenu.id, originalEdges);
    parentIds.add(contextMenu.id); // Inclui o nó selecionado
    filterNodesAndEdges(parentIds);
  };
  
  const handleFilterChildren = () => {
    if (!contextMenu) return;
    const childIds = getDescendants(contextMenu.id, originalEdges);
    childIds.add(contextMenu.id); // Inclui o nó selecionado
    filterNodesAndEdges(childIds);
  };
  
  const handleResetFilter = () => {
    setNodes(originalNodes);
    setEdges(originalEdges);
    setContextMenu(null);
  };


  const TabButton = ({ isActive, onClick, children }) => (
    <button onClick={onClick} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {children}
    </button>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow">
      <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Mapa de Relacionamentos de Serviços</h1>
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4 mt-4">
              <div className='flex-grow'>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Recurso</label>
                  <input type="text" name="name" id="name" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm" value={filters.name} onChange={handleFilterChange} placeholder="Ex: api-principal" />
              </div>
              <div className='flex-grow'>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (chave:valor)</label>
                  <input type="text" name="tags" id="tags" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm" value={filters.tags} onChange={handleFilterChange} placeholder="Ex: env:prod,app:core" />
              </div>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Filtrar</button>
          </form>
      </div>
      
      <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 px-4" aria-label="Tabs">
            <TabButton isActive={activeTab === 'visual'} onClick={() => setActiveTab('visual')}>Visual</TabButton>
            <TabButton isActive={activeTab === 'dot'} onClick={() => setActiveTab('dot')}>Linguagem DOT</TabButton>
          </nav>
      </div>

      <div className="flex-grow w-full h-full relative" ref={mapRef}>
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">A carregar...</div>}
        {error && !loading && <div className="absolute inset-0 z-10 flex items-center justify-center text-red-600 p-4 text-center">{error}</div>}
        
        {activeTab === 'visual' ? (
            <VisualMap nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick} onPaneClick={onPaneClick} onNodeContextMenu={onNodeContextMenu} selectedNode={selectedNode} />
        ) : (
            <DotLanguageViewer dotScript={dotScript} />
        )}
        
        {contextMenu && (
            <NodeContextMenu 
                top={contextMenu.top}
                left={contextMenu.left}
                onFilterParents={handleFilterParents}
                onFilterChildren={handleFilterChildren}
                onResetFilter={handleResetFilter}
            />
        )}
      </div>
    </div>
  );
};

export default ServiceMapPage;
