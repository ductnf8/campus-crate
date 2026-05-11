import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: 'user', content: text };
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const formatInvokeError = (error: unknown): string => {
      if (error instanceof FunctionsFetchError) {
        const cause = error.context;
        const detail =
          cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : '';
        return [
          'Không gửi được yêu cầu tới Edge Function `ai-chat` (mạng / CORS / URL).',
          detail ? `Chi tiết: ${detail}` : '',
          '— Gợi ý: Trong Supabase Dashboard → Edge Functions, kiểm tra đã deploy `ai-chat`.',
          '— Chạy: `supabase functions deploy ai-chat` và set secret `AI_API_KEY` (OpenRouter hoặc provider bạn dùng).',
          '— Kiểm tra `.env` đúng `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` của project đó; tắt extension chặn request.',
        ]
          .filter(Boolean)
          .join('\n');
      }
      if (error instanceof FunctionsRelayError) {
        return `Lỗi relay Supabase: ${error.message}\n(Function có đang deploy / region đúng không?)`;
      }
      if (error instanceof FunctionsHttpError) {
        const status = typeof error.context?.status === 'number' ? error.context.status : '?';
        const hint =
          status === 404
            ? 'Không tìm thấy function — hãy deploy: `supabase functions deploy ai-chat`.'
            : 'Kiểm tra log function trên Dashboard; thường thiếu secret `AI_API_KEY` hoặc lỗi gọi nhà cung cấp AI.';
        return `HTTP ${status}: ${error.message}\n${hint}`;
      }
      return `Lỗi: ${error instanceof Error ? error.message : String(error)}`;
    };

    try {
      const { data, error } = await supabase.functions.invoke<{ content?: string; error?: string }>(
        'ai-chat',
        { body: { messages: [...messages, userMsg] } },
      );
      if (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: formatInvokeError(error) }]);
      } else {
        const text = data?.content || data?.error || 'Không có phản hồi.';
        setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: formatInvokeError(e) }]);
    }
    setLoading(false);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/')) {
      e.preventDefault();
      setOpen(false);
      navigate(href);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary shadow-xl shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-105 active:scale-95 transition-transform"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b bg-gradient-primary text-primary-foreground">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">StuMarket AI</h3>
                <p className="text-xs opacity-80">Trợ lý mua bán thông minh</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Xin chào! 👋</p>
                  <p className="text-xs">Mình là trợ lý AI của StuMarket.<br/>Hỏi mình bất cứ điều gì về mua bán nhé!</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Mẹo bán hàng nhanh', 'Định giá laptop cũ', 'Giao dịch an toàn'].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-xs px-3 py-1.5 rounded-full border bg-muted hover:bg-accent transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    {m.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&_a]:text-primary [&_a]:font-medium [&_a]:underline">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children, ...props }) => (
                              <a href={href} onClick={(e) => href && handleLinkClick(e, href)} {...props}>{children}</a>
                            ),
                          }}
                        >{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Hỏi gì đó..."
                  className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-xl bg-gradient-primary h-10 w-10 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
