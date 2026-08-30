import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { AgentAction } from '@ai-commerce/shared';
import { ShieldCheck, Terminal, Layers, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/agent/actions');
      if (res.data.success) {
        setActions(res.data.data.actions);
      }
    } catch (err) {} finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Auto-refresh every 5s when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchActions, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchActions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return (
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <CheckCircle className="h-2.5 w-2.5" /> Executed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <XCircle className="h-2.5 w-2.5" /> Rejected
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Clock className="h-2.5 w-2.5" /> Pending
          </span>
        );
      default:
        return (
          <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  const getAgentTypeBadge = (type: string) => {
    const isGrowth = type === 'GROWTH_AGENT';
    return (
      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
        isGrowth
          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      }`}>
        {type}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-400" />
            <span>AI Agent Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all AI agent tool calls, input schemas, reasoning logs, and confirmation statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Live' : 'Auto-Refresh'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={fetchActions}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {actions.length > 0 && (
        <div className="flex items-center space-x-4 text-xs text-slate-400 bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <span>Total Actions: <strong className="text-white">{actions.length}</strong></span>
          <span className="text-slate-700">|</span>
          <span>Commerce: <strong className="text-purple-400">{actions.filter(a => a.agentType === 'COMMERCE_AGENT').length}</strong></span>
          <span className="text-slate-700">|</span>
          <span>Growth: <strong className="text-indigo-400">{actions.filter(a => a.agentType === 'GROWTH_AGENT').length}</strong></span>
        </div>
      )}

      <div className="space-y-4">
        {isLoading && actions.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <div className="h-4 w-20 skeleton" />
                    <div className="h-4 w-28 skeleton" />
                  </div>
                  <div className="h-4 w-32 skeleton" />
                </div>
                <div className="h-4 w-full skeleton" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 skeleton" />
                  <div className="h-24 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : actions.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-3 rounded-xl border border-slate-800 animate-fade-in-up">
            <Terminal className="h-12 w-12 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-400">No Agent Actions Recorded</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Chat with the AI Shopping Assistant to populate live tool execution logs.
            </p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {actions.map((act) => (
              <div key={act.actionId} className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3 font-mono">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    {getAgentTypeBadge(act.agentType)}
                    <span className="text-white font-bold">{act.actionName}</span>
                    {getStatusBadge(act.status)}
                  </div>
                  <span className="text-slate-500 text-[11px]">{new Date(act.createdAt).toLocaleString()}</span>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-slate-500 font-semibold">Reasoning: </span>
                  <span>{act.reasoning}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto max-h-40">
                    <span className="text-slate-500 block font-bold mb-1">Input Payload:</span>
                    <pre className="text-blue-300 whitespace-pre-wrap">{JSON.stringify(act.inputPayload, null, 2)}</pre>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto max-h-40">
                    <span className="text-slate-500 block font-bold mb-1">Output Payload:</span>
                    <pre className="text-emerald-300 whitespace-pre-wrap">{JSON.stringify(act.outputPayload, null, 2)}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
