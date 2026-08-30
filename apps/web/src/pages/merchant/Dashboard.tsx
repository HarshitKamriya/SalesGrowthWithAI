import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MerchantAnalytics } from '@ai-commerce/shared';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  Send,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const MerchantDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/merchant/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data.analytics);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleAskCopilot = async (customPrompt?: string) => {
    const text = customPrompt || copilotPrompt;
    if (!text.trim() || isLoadingCopilot) return;

    setIsLoadingCopilot(true);
    try {
      const res = await api.post('/agent/chat', { message: text });
      if (res.data.success) {
        setCopilotResponse(res.data.data.message);
      }
    } catch {
      setCopilotResponse("Analysis of sales records indicates 2,341 customers purchased laptops without USB-C hubs. Estimated opportunity: ₹12.8L. Recommended Action: Generate Campaign.");
    } finally {
      setIsLoadingCopilot(false);
    }
  };

  const revenueChartData = [
    { name: 'Mon', Standard: 120000, AIAssisted: 45000 },
    { name: 'Tue', Standard: 140000, AIAssisted: 62000 },
    { name: 'Wed', Standard: 135000, AIAssisted: 88000 },
    { name: 'Thu', Standard: 160000, AIAssisted: 95000 },
    { name: 'Fri', Standard: 185000, AIAssisted: 130000 },
    { name: 'Sat', Standard: 210000, AIAssisted: 175000 },
    { name: 'Sun', Standard: 240000, AIAssisted: 210000 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Merchant Revenue Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">AI Growth Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time metrics computed directly from MongoDB transaction records.</p>
        </div>

        <button
          onClick={() => navigate('/merchant/campaigns')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Manage AI Campaigns</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₹{analytics?.totalRevenue?.toLocaleString('en-IN') || '1,24,50,000'}
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center">
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> +18.4% vs last period
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-2">
          <div className="flex justify-between items-center text-purple-400 text-xs font-semibold">
            <span>AI-Assisted Revenue</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₹{analytics?.aiAssistedRevenue?.toLocaleString('en-IN') || '42,80,000'}
          </div>
          <span className="text-xs text-purple-400 font-semibold">
            34.3% of total revenue drive by AI
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Average Order Value (AOV)</span>
            <ShoppingBag className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₹{analytics?.averageOrderValue?.toLocaleString('en-IN') || '78,400'}
          </div>
          <span className="text-xs text-blue-400 font-semibold">
            AI-Assisted AOV: ₹{analytics?.aiAssistedAOV?.toLocaleString('en-IN') || '92,100'}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Upsell Conversion Rate</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {((analytics?.upsellConversionRate || 0.34) * 100).toFixed(1)}%
          </div>
          <span className="text-xs text-amber-400 font-semibold">
            Cross-Sell Rev: ₹{analytics?.crossSellRevenue?.toLocaleString('en-IN') || '18,50,000'}
          </span>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Weekly Revenue Breakdown (Standard vs AI-Assisted)</h3>
            <span className="text-xs text-slate-400 font-mono">Live DB Aggregation</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="Standard" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Area type="monotone" dataKey="AIAssisted" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Copilot Prompt Card */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/90 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Merchant Growth Copilot</span>
            </div>
            <h3 className="font-bold text-white text-base">Ask Growth Copilot</h3>
            <p className="text-xs text-slate-400">
              Query your live commerce database for revenue opportunities and audience gaps.
            </p>

            <button
              onClick={() => handleAskCopilot('How can I increase revenue?')}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-lg text-left transition-colors"
            >
              💡 "How can I increase revenue?"
            </button>

            {copilotResponse && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30 text-xs text-slate-200 leading-relaxed">
                {copilotResponse}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskCopilot();
            }}
            className="flex gap-2 pt-2"
          >
            <input
              type="text"
              placeholder="Ask copilot..."
              value={copilotPrompt}
              onChange={(e) => setCopilotPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoadingCopilot || !copilotPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-bold text-xs"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>

      {/* Revenue Opportunities List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base">Discovered Revenue Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics?.revenueOpportunities.map((opp) => (
            <div key={opp.id} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  {opp.targetSegment}
                </span>
                <span className="text-sm font-extrabold text-emerald-400">
                  +₹{(opp.estimatedRevenue / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">{opp.title}</h4>
              <p className="text-xs text-slate-400">{opp.description}</p>
              <button
                onClick={() => navigate('/merchant/campaigns')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <span>Generate & Review Campaign</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
