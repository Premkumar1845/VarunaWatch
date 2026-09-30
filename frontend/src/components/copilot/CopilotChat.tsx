'use client';

import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI, ChatMessage } from '@/lib/api';
import { 
  Bot, 
  Send, 
  FileText, 
  Copy, 
  Check, 
  Hospital, 
  Navigation, 
  Landmark, 
  Loader2 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useCoastalLane } from '@/context/CoastalLaneContext';

interface CopilotChatProps {
  initialZone?: string;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ initialZone }) => {
  const { currentLane } = useCoastalLane();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `### 🌊 VarunaWatch Pan-India Disaster Decision Copilot Active

I am synchronized with real-time telemetry for **${currentLane.cycloneTrackName} (Category ${currentLane.cycloneCategory})** covering **${currentLane.name}** (${currentLane.coastline_km} km Coastline).

**Key Situational Parameters:**
- **Coastal Sector:** ${currentLane.name} (${currentLane.basin})
- **Active Response Force:** ${currentLane.sdrfForce}
- **Monitored Hubs:** ${currentLane.keyDistricts.slice(0, 4).join(', ')} & ${currentLane.keyPorts.slice(0, 2).join(', ')}

Select a rapid operational SOP below or enter a custom directive query:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      label: '📋 12h Collector SOP',
      prompt: `Draft an urgent 12-hour pre-landfall Standard Operating Procedure (SOP) for District Collectors across ${currentLane.shortName}.`,
      icon: FileText,
    },
    {
      label: '🏥 Oxygen & Fuel Matrix',
      prompt: `Provide a critical backup fuel and oxygen cylinder relocation plan for coastal hospitals in ${currentLane.shortName}.`,
      icon: Hospital,
    },
    {
      label: '🛣 Corridors at Risk',
      prompt: `Which highway corridors and port approach links in ${currentLane.shortName} are at risk of storm surge inundation?`,
      icon: Navigation,
    },
    {
      label: '💰 SDRF Liquidity Brief',
      prompt: `Generate an SDRF / NDRF parametric verification summary for ${currentLane.sdrfForce}.`,
      icon: Landmark,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAI(textToSend, {
        active_zone: initialZone || currentLane.name,
        state_id: currentLane.id,
        cyclone_category: currentLane.cycloneCategory,
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error synchronizing telemetry: ${e.message || 'Service temporarily unavailable.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-[#111827]">
      {/* Top Banner */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Varuna AI Decision Intelligence Copilot ({currentLane.shortName})
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
          Deterministic Ground-Truth Engine
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, i) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={i}
              className={`flex gap-3 max-w-4xl ${isAssistant ? 'items-start' : 'items-start ml-auto flex-row-reverse'}`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
              )}

              <div
                className={`p-4 rounded-xl text-xs leading-relaxed space-y-2 relative group ${
                  isAssistant
                    ? 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs'
                    : 'bg-cyan-600 text-white shadow-xs'
                }`}
              >
                <div className="prose dark:prose-invert prose-xs max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-800/60 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {isAssistant && (
                    <button
                      onClick={() => copyMessage(msg.content, i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-500 hover:text-cyan-600"
                    >
                      {copiedIndex === i ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedIndex === i ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-3">
            <Loader2 size={15} className="animate-spin text-cyan-500" />
            <span>Varuna AI synthesizing multi-state telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {quickPrompts.map((qp) => {
            const Icon = qp.icon;
            return (
              <button
                key={qp.label}
                onClick={() => handleSend(qp.prompt)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 hover:text-cyan-600 text-[11px] font-medium whitespace-nowrap text-slate-700 dark:text-slate-300 transition-all shadow-xs shrink-0"
              >
                <Icon size={13} className="text-cyan-600 dark:text-cyan-400" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Varuna AI about ${currentLane.shortName} evacuation routes, hospital protocols, or storm surge...`}
            disabled={loading}
            className="field flex-1 text-xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary shrink-0"
          >
            <Send size={14} />
            <span>Send Directive</span>
          </button>
        </form>
      </div>
    </div>
  );
};
