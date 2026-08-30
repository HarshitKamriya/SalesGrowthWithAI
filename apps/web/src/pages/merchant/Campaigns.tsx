import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Campaign } from '@ai-commerce/shared';
import { TrendingUp, CheckCircle, Clock, Play, Plus, ShieldAlert } from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/merchant/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.data.campaigns);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleApproveCampaign = async (campaignId: string) => {
    setIsLoading(true);
    try {
      const res = await api.post(`/merchant/campaigns/${campaignId}/approve`);
      if (res.data.success) {
        await fetchCampaigns();
      }
    } catch (err) {} finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Approval</span>;
      case 'APPROVED':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'RUNNING':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse"><Play className="h-3 w-3" /> Running (Demo Mode)</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-400" />
            <span>AI Growth Campaigns</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Merchant Approval Required. Sensitive campaigns cannot execute without merchant authorization.
          </p>
        </div>

        <button
          onClick={async () => {
            await api.post('/merchant/campaigns', {
              title: 'Ergonomic Desk Accessories Cross-Sell',
              description: 'Target 890 gaming laptop buyers with 10% discount on mechanical keyboards.',
              targetSegment: 'Gaming Laptop Purchasers',
              targetProductId: 'prod_keyboard_1',
              offerDiscountPercentage: 10,
              budget: 25000,
              expectedConversionRate: 0.12,
              estimatedRevenue: 445000
            });
            fetchCampaigns();
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Propose New AI Campaign</span>
        </button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center space-x-3 text-amber-300 text-xs">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
        <span>
          <strong>Fintech Security Policy:</strong> AI Agents cannot spend budget or launch customer campaigns without merchant confirmation. Review campaign details below and click "Approve".
        </span>
      </div>

      <div className="space-y-4">
        {campaigns.map((c) => (
          <div key={c.campaignId} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-mono text-slate-500">ID: {c.campaignId}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{c.title}</h3>
              </div>
              <div>{getStatusBadge(c.status)}</div>
            </div>

            <p className="text-xs text-slate-300">{c.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl text-xs font-mono border border-slate-800">
              <div>
                <span className="text-slate-500 block">Target Audience</span>
                <span className="text-white font-bold">{c.targetSegment}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Offer Discount</span>
                <span className="text-emerald-400 font-bold">{c.offerDiscountPercentage}% OFF</span>
              </div>
              <div>
                <span className="text-slate-500 block">Allocated Budget</span>
                <span className="text-white font-bold">₹{c.budget?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Est. Revenue Impact</span>
                <span className="text-purple-400 font-bold">₹{c.estimatedRevenue?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {c.status === 'PENDING_APPROVAL' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleApproveCampaign(c.campaignId)}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve & Authorize Campaign Execution</span>
                </button>
              </div>
            )}

            {c.status === 'RUNNING' && (
              <div className="flex justify-between items-center text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                <span>Campaign is actively running. Generating automated conversions...</span>
                <span>Actual Revenue: ₹{c.actualRevenue?.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
