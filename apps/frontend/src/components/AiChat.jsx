import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '../lib/axios';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export const AiChat = ({ problemTitle, userCode, language, isOpen, onClose, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-send initial message if provided and chat is opened
  useEffect(() => {
    if (isOpen && initialMessage) {
      handleSend(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMessage]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageOverride = null) => {
    const userMsg = typeof messageOverride === 'string' ? messageOverride.trim() : input.trim();
    if (!userMsg) return;

    if (typeof messageOverride !== 'string') {
      setInput('');
    }
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/hint', {
        problemTitle,
        userCode,
        message: userMsg,
        language,
      });

      setMessages((prev) => [...prev, { role: 'ai', content: res.data.data.reply }]);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
          className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] rounded-2xl border dark:border-white/10 border-neutral-200 shadow-2xl flex flex-col overflow-hidden z-50 dark:bg-[#0f0f11]/95 bg-white/95 backdrop-blur-xl font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/5 border-neutral-100 dark:bg-white/[0.02] bg-neutral-50/50">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
              <Bot size={18} />
              <span className="font-semibold text-sm tracking-wide">Groq AI Assistant</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg dark:hover:bg-white/10 hover:bg-neutral-200 transition-colors text-neutral-500 dark:text-neutral-400 dark:hover:text-white hover:text-neutral-900"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-neutral-500 dark:text-neutral-400">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400 mb-2 shadow-[0_0_15px_rgba(124,58,237,0.1)] dark:shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                  <Bot size={32} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                  Groq AI Helper
                </h3>
                <p className="text-sm max-w-[240px] leading-relaxed">
                  Stuck on{' '}
                  <strong className="text-violet-600 dark:text-violet-300">{problemTitle}</strong>?
                  I can analyze your code and give you progressive hints without giving away the
                  solution!
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    Get Hints
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Find Bugs
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Explain Logic
                  </span>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm',
                      m.role === 'user'
                        ? 'bg-violet-600 text-white rounded-2xl rounded-br-sm'
                        : 'dark:bg-white/5 bg-neutral-100 border dark:border-white/10 border-neutral-200 text-neutral-800 dark:text-neutral-200 rounded-2xl rounded-bl-sm',
                    )}
                  >
                    {m.role === 'ai' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed dark:prose-pre:bg-black/50 prose-pre:bg-neutral-50 prose-pre:border dark:prose-pre:border-white/10 prose-pre:border-neutral-200">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 dark:bg-white/5 bg-neutral-100 border dark:border-white/10 border-neutral-200">
                  <Loader2
                    size={14}
                    className="animate-spin text-violet-600 dark:text-violet-400"
                  />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    Groq is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t dark:border-white/10 border-neutral-200 dark:bg-[#0f0f11] bg-white">
            <div className="flex items-center gap-2 rounded-xl border dark:border-white/10 border-neutral-200 dark:bg-black/40 bg-neutral-50 px-2 py-2 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for a hint..."
                className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none px-2"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-violet-600 text-white disabled:opacity-50 hover:bg-violet-500 transition-colors shadow-[0_0_10px_rgba(124,58,237,0.3)]"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
