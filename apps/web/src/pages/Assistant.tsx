import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShoppingCart,
  CheckCircle,
  CreditCard,
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  toolCalls?: any[];
  suggestions?: any;
  timestamp: string;
}

// Simple markdown-like renderer for bold text and line breaks
const RenderMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

// Typing indicator with bouncing dots
const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3 animate-message-in">
    <div className="h-8 w-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 mt-1">
      <Bot className="h-4 w-4 text-purple-400" />
    </div>
    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-5 py-4 flex items-center space-x-2">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
      <span className="text-xs text-slate-500 ml-2">AI reasoning over MongoDB & Neo4j RAG...</span>
    </div>
  </div>
);

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Hello! I am your AI Commerce Assistant powered by Gemini API, MongoDB, and Neo4j Graph + Vector RAG. What are you looking to buy today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, refreshCart } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.post('/agent/chat', {
        message: textToSend,
        conversationHistory: messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text
        }))
      });

      if (res.data.success) {
        const agentData = res.data.data;
        const agentMsg: ChatMessage = {
          id: `agent_${Date.now()}`,
          sender: 'agent',
          text: agentData.message,
          toolCalls: agentData.toolCalls,
          suggestions: agentData.uiSuggestions,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, agentMsg]);
        await refreshCart();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'agent',
          text: 'Sorry, I encountered an issue processing your request. Please try again or rephrase your query.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickAdd = async (productId: string) => {
    await addToCart(productId, 1);
    handleSendMessage(`Add ${productId} to my cart`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800 animate-fade-in-up">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-md animate-pulse-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">AI Shopping & Growth Assistant</h2>
            <p className="text-xs text-slate-400">Tool Calling Agent • Grounded MongoDB & Neo4j RAG</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            ● Razorpay Test Ready
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <span className="text-slate-500 font-semibold shrink-0">Try:</span>
        {[
          { label: '"Laptop for ML under ₹80k"', msg: 'Find me a laptop for machine learning under ₹80,000' },
          { label: '"Add laptop & suggest accessories"', msg: 'Add ASUS TUF Gaming A15 to my cart and suggest accessories' },
          { label: '"Checkout & Pay"', msg: 'Proceed to checkout and create Razorpay order' },
          { label: '"Compare laptops"', msg: 'Compare the top 2 laptops for programming and data science' }
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleSendMessage(chip.msg)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap transition-all hover:border-purple-500/40 hover:text-purple-300"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 min-h-[500px] max-h-[650px] overflow-y-auto space-y-6 border border-slate-800 bg-slate-950/60">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}>
            
            {m.sender === 'agent' && (
              <div className="h-8 w-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-purple-400" />
              </div>
            )}

            <div className={`space-y-3 max-w-2xl ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                }`}
              >
                <RenderMarkdown text={m.text} />
              </div>

              {/* Timestamp */}
              <div className={`flex items-center space-x-1 text-[10px] text-slate-600 ${m.sender === 'user' ? 'justify-end' : ''}`}>
                <Clock className="h-2.5 w-2.5" />
                <span>{formatTime(m.timestamp)}</span>
              </div>

              {/* Tool Execution Badges */}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {m.toolCalls.map((tc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-800 text-purple-400 px-2.5 py-1 rounded-md font-mono text-[11px] animate-fade-in-up"
                    >
                      <Layers className="h-3 w-3 text-purple-400" />
                      <span>Tool: {tc.tool}()</span>
                    </span>
                  ))}
                </div>
              )}

              {/* UI Suggestion: Product Recommendation Cards */}
              {m.suggestions?.showProducts && m.suggestions.showProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {m.suggestions.showProducts.slice(0, 2).map((p: any) => (
                    <div key={p.productId} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-blue-500/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                        <span className="text-xs text-slate-400">Score: {p.relevanceScore || 0.95}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                      <div className="text-xs text-slate-400">
                        Price: <span className="text-white font-bold">₹{p.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        onClick={() => handleQuickAdd(p.productId)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all hover:scale-[1.02]"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* UI Suggestion: Upsell Recommendation */}
              {m.suggestions?.showUpsell && (
                <div className="bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    <span>Growth Agent Recommended Upsell</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.suggestions.showUpsell.product.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{m.suggestions.showUpsell.reason}</p>
                    </div>
                    <span className="text-sm font-extrabold text-white shrink-0 ml-2">
                      ₹{m.suggestions.showUpsell.product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuickAdd(m.suggestions.showUpsell.product.productId)}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Accept & Add Accessory (₹{m.suggestions.showUpsell.product.price.toLocaleString('en-IN')})</span>
                  </button>
                </div>
              )}

              {/* UI Suggestion: Order Confirmation & Razorpay Trigger */}
              {m.suggestions?.showOrderConfirmation && (
                <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Order Created (Pending Payment)</span>
                    <span className="text-xs font-mono text-slate-400">ID: {m.suggestions.showOrderConfirmation.orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white">
                    <span>Total Amount Payable:</span>
                    <span className="text-emerald-400 text-base">₹{m.suggestions.showOrderConfirmation.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01]"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Proceed to Explicit Razorpay Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>

            {m.sender === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 mt-1">
                <User className="h-4 w-4 text-blue-400" />
              </div>
            )}

          </div>
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 animate-fade-in-up"
        style={{ animationDelay: '0.15s' }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask AI assistant for laptops, accessories, or cart guidance..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-600/20"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
};
