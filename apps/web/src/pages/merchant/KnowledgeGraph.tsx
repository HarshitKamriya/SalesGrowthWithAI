import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { GitFork, Layers, Database, Sparkles, Loader2, Network } from 'lucide-react';

// Skeleton node
const NodeSkeleton: React.FC = () => (
  <div className="p-4 rounded-xl border border-slate-700 space-y-2 bg-slate-800/30">
    <div className="flex justify-between items-center">
      <div className="h-4 w-14 skeleton" />
      <div className="h-3 w-16 skeleton" />
    </div>
    <div className="h-5 w-36 skeleton" />
  </div>
);

export const KnowledgeGraph: React.FC = () => {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const fetchGraph = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/merchant/graph');
      if (res.data.success) {
        setGraphData(res.data.data.graph);
      }
    } catch (err) {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Product':
        return 'bg-blue-600/30 border-blue-500 text-blue-300';
      case 'UseCase':
        return 'bg-purple-600/30 border-purple-500 text-purple-300';
      case 'Category':
        return 'bg-amber-600/30 border-amber-500 text-amber-300';
      case 'Customer':
        return 'bg-emerald-600/30 border-emerald-500 text-emerald-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getRelationLinks = (nodeId: string) => {
    return graphData.links.filter(l => l.source === nodeId || l.target === nodeId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 animate-fade-in-up">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Neo4j Hybrid Graph + Vector RAG Layer
          </span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-2">
            <GitFork className="h-6 w-6 text-emerald-400" />
            <span>Commerce Knowledge Graph</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Relationship-aware topology connecting products, compatible accessories, customer intent, and use cases.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            <Database className="h-3 w-3" />
            <span>Neo4j Vector Index: Active</span>
          </span>
        </div>
      </div>

      {/* Graph Node Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-semibold bg-slate-900/60 p-4 rounded-xl border border-slate-800 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <span className="text-slate-500">Graph Node Schema:</span>
        <span className="px-2.5 py-0.5 rounded border bg-blue-600/20 border-blue-500 text-blue-300">● Product</span>
        <span className="px-2.5 py-0.5 rounded border bg-purple-600/20 border-purple-500 text-purple-300">● UseCase</span>
        <span className="px-2.5 py-0.5 rounded border bg-emerald-600/20 border-emerald-500 text-emerald-300">● Customer</span>
        <span className="px-2.5 py-0.5 rounded border bg-amber-600/20 border-amber-500 text-amber-300">● Category</span>
      </div>

      {/* Interactive Topology Container */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 bg-slate-950/80 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>Ingested Graph Nodes & Relationships</span>
          {!isLoading && (
            <span className="text-xs text-slate-500 font-normal ml-2">
              {graphData.nodes.length} nodes • {graphData.links.length} edges
            </span>
          )}
        </h3>

        {/* Nodes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <NodeSkeleton key={i} />)}
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Network className="h-12 w-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-400">No Graph Data Available</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Connect your Neo4j database or seed sample data to populate the knowledge graph topology.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
            {graphData.nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${getNodeColor(node.type)} space-y-2 ${
                  selectedNode?.id === node.id ? 'ring-2 ring-offset-2 ring-offset-slate-950 ring-blue-500 scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950/60">
                    {node.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {node.id}</span>
                </div>
                <h4 className="font-bold text-sm text-white">{node.label}</h4>
                {selectedNode?.id === node.id && (
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/50">
                    {getRelationLinks(node.id).length} connected edge(s)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Relationships List */}
        {!isLoading && graphData.links.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Active Cypher Traversal Edges</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono stagger-children">
              {graphData.links.map((link, idx) => (
                <div
                  key={idx}
                  className={`bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between transition-all ${
                    selectedNode && (link.source === selectedNode.id || link.target === selectedNode.id)
                      ? 'border-blue-500/50 bg-blue-950/20'
                      : ''
                  }`}
                >
                  <span className="text-blue-300 font-semibold">{link.source}</span>
                  <span className="text-purple-400 font-bold text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    -[:{link.relation}]-&gt;
                  </span>
                  <span className="text-emerald-300 font-semibold">{link.target}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
