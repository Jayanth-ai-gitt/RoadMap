import React, { useEffect, useRef, useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [error, setError] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'What should I learn next?',
    'Am I ready for AWS Solutions certification?',
    'Explain Kubernetes in production terms.',
    'Recommend a complex systems project.'
  ];

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const data = await api.getChatHistory();
        setMessages(data.history || []);
      } catch (err) {
        console.error(err);
        setError('Could not load chat history.');
      } finally {
        setFetchingHistory(false);
      }
    };
    fetchChatHistory();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend || textToSend.trim() === '') return;
    setInputText('');
    setLoading(true);
    setError('');

    // Optimistically add user message
    const tempUserMsg = { id: Date.now().toString(), role: 'user', message: textToSend, createdAt: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const data = await api.sendChatMessage(textToSend);
      // Replace or add assistant message
      setMessages(prev => [...prev, data.message]);
    } catch (err) {
      setError('Chatbot service is temporarily unresponsive. Make sure API backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  if (fetchingHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-muted font-semibold">Initiating mentor terminal connection...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[75vh] glass-panel rounded-2xl overflow-hidden border-dark-border/40 relative">
      
      {/* Top Banner */}
      <div className="flex items-center gap-3 px-6 py-4 bg-dark-card border-b border-dark-border/40 shrink-0">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/15 shrink-0">
          <MessageSquare className="w-5 h-5" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-dark-card rounded-full" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-white">Dave (Senior Architect)</h3>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              15+ Yrs Exp
            </span>
          </div>
          <p className="text-[10px] text-dark-muted">Online — Ask anything about Cloud, DevOps, or system design pitfalls.</p>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-dark-bg/15">
        
        {/* Welcome bubble */}
        {messages.length === 0 && (
          <div className="max-w-[85%] bg-dark-card border border-dark-border/30 rounded-2xl p-4 mr-auto">
            <p className="text-xs text-dark-text leading-relaxed">
              Hey there. I'm Dave. I've spent the last 15+ years building and maintaining distributed systems, and I've seen a lot of juniors fall into the same traps (hello tutorial hell, over-engineering, and bloating Docker images).
            </p>
            <p className="text-xs text-dark-text leading-relaxed mt-2 font-bold">
              What are we diagnosing today? Select a quick prompt below or type your question.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const bubbleClass = isUser 
            ? 'ml-auto bg-blue-600 text-white rounded-tr-none' 
            : 'mr-auto bg-dark-card border border-dark-border/30 text-dark-text rounded-tl-none';
          
          return (
            <div key={msg.id} className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${bubbleClass}`}>
              {/* Parse markdown bold and list in message */}
              <div 
                dangerouslySetInnerHTML={{
                  __html: msg.message
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/- (.*?)\n/g, '• $1<br/>')
                }}
              />
              <span className="block text-[8px] text-right text-dark-muted mt-2">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Loading typing bubble */}
        {loading && (
          <div className="mr-auto bg-dark-card border border-dark-border/30 rounded-2xl rounded-tl-none p-4 max-w-[85%] flex items-center gap-2">
            <span className="text-[10px] text-dark-muted">Dave is typing</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-[10px] font-semibold shrink-0">
          {error}
        </div>
      )}

      {/* Quick chips footer */}
      {messages.length < 5 && (
        <div className="px-6 py-3 border-t border-dark-border/40 flex flex-wrap gap-2 shrink-0 bg-dark-card/20">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 bg-dark-card border border-dark-border/60 hover:border-dark-border text-[10px] font-semibold rounded-lg text-dark-muted hover:text-white transition-all flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input panel */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-border/40 flex gap-2 shrink-0 bg-dark-card">
        <input
          type="text"
          placeholder="Ask Dave (e.g. explain rebasing, recommend a project, check my prep...)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-3 bg-dark-bg border border-dark-border/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-white"
          required
        />
        <button
          type="submit"
          disabled={loading || inputText.trim() === ''}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/10 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
export default Chatbot;
