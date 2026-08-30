import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AgentAction } from '@ai-commerce/shared';
import { ShieldCheck, Terminal, Layers } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const [actions, setActions] = useState<AgentAction[]>([]);

  const fetchActions = async () => {
    try {
      const res = await api.get('/agent/actions');
      if (res.data.success) {
        setActions(res.data.data.actions);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchActions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-400" />
            <span>AI Agent Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all AI agent tool calls, input schemas, reasoning logs, and confirmation statuses.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs rounded-xl">
            No agent actions recorded yet. Chat with the AI Shopping Assistant to populate live tool logs.
          </div>
        ) : (
          actions.map((act) => (
            <div key={act.actionId} className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3 font-mono">
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-bold">
                    {act.agentType}
                  </span>
                  <span className="text-white font-bold">{act.actionName}</span>
                </div>
                <span className="text-slate-500 text-[11px]">{new Date(act.createdAt).toLocaleString()}</span>
              </div>

              <div className="text-xs text-slate-300">
                <span className="text-slate-500 font-semibold">Reasoning: </span>
                <span>{act.reasoning}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                  <span className="text-slate-500 block font-bold mb-1">Input Payload:</span>
                  <pre className="text-blue-300">{JSON.stringify(act.inputPayload, null, 2)}</pre>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                  <span className="text-slate-500 block font-bold mb-1">Output Payload:</span>
                  <pre className="text-emerald-300">{JSON.stringify(act.outputPayload, null, 2)}</pre>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
