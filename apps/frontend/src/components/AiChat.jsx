import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Lightbulb, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '../lib/axios';
import { toast } from 'sonner';

export const AiChat = ({ problemTitle, userCode, language, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
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
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] rounded-2xl border shadow-2xl flex flex-col overflow-hidden z-50"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            height: '500px',
            maxHeight: 'calc(100vh - 6rem)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 text-emerald-500">
              <Bot size={18} />
              <span className="font-semibold text-sm">Groq AI Assistant</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X size={16} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div
                className="h-full flex flex-col items-center justify-center text-center space-y-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                  <Lightbulb size={24} />
                </div>
                <p className="text-sm font-medium">Stuck on {problemTitle}?</p>
                <p className="text-xs max-w-[200px] leading-relaxed">
                  Ask me for a hint, to explain a concept, or to review your code!
                </p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === 'user'
                        ? 'bg-emerald-500 text-white rounded-br-sm'
                        : 'rounded-bl-sm'
                    }`}
                    style={{
                      background: m.role === 'ai' ? 'var(--color-surface-2)' : undefined,
                      color: m.role === 'ai' ? 'var(--color-text)' : undefined,
                    }}
                  >
                    {m.role === 'ai' ? (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  <Loader2 size={14} className="animate-spin text-emerald-500" />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Groq is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-3 border-t"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="flex items-center gap-2 rounded-xl border px-2 py-2"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for a hint..."
                className="flex-1 bg-transparent text-sm outline-none px-2"
                style={{ color: 'var(--color-text)' }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-emerald-500 text-white disabled:opacity-50 hover:bg-emerald-600 transition-colors"
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
