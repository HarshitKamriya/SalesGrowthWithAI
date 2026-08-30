import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { GitFork, Layers, Database, Sparkles } from 'lucide-react';

export const KnowledgeGraph: React.FC = () => {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });

  const fetchGraph = async () => {
    try {
      const res = await api.get('/merchant/graph');
      if (res.data.success) {
        setGraphData(res.data.data.graph);
      }
    } catch (err) {}
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
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
      <div className="flex flex-wrap gap-4 text-xs font-semibold bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <span className="text-slate-500">Graph Node Schema:</span>
        <span className="px-2.5 py-0.5 rounded border bg-blue-600/20 border-blue-500 text-blue-300">● Product</span>
        <span className="px-2.5 py-0.5 rounded border bg-purple-600/20 border-purple-500 text-purple-300">● UseCase</span>
        <span className="px-2.5 py-0.5 rounded border bg-emerald-600/20 border-emerald-500 text-emerald-300">● Customer</span>
        <span className="px-2.5 py-0.5 rounded border bg-amber-600/20 border-amber-500 text-amber-300">● Category</span>
      </div>

      {/* Interactive Topology Container */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 bg-slate-950/80">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>Ingested Graph Nodes & Relationships</span>
        </h3>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {graphData.nodes.map((node) => (
            <div key={node.id} className={`p-4 rounded-xl border ${getNodeColor(node.type)} space-y-2`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950/60">
                  {node.type}
                </span>
                <span className="text-[10px] font-mono text-slate-400">ID: {node.id}</span>
              </div>
              <h4 className="font-bold text-sm text-white">{node.label}</h4>
            </div>
          ))}
        </div>

        {/* Relationships List */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Active Cypher Traversal Edges</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            {graphData.links.map((link, idx) => (
              <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-blue-300 font-semibold">{link.source}</span>
                <span className="text-purple-400 font-bold text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  -[:{link.relation}]-&gt;
                </span>
                <span className="text-emerald-300 font-semibold">{link.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
