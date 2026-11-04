import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Trash2, 
  History, 
  CornerDownLeft, 
  Terminal, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function QueryConsole({
  query,
  onChangeQuery,
  onRunQuery,
  isQuerying,
  hasMore,
  onNextSolution,
  quickQueries = [],
  history = [],
  onSelectHistory
}) {
  const inputRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleKeyDown = (e) => {
    // If user presses semicolon ';' while there is a query with more solutions, fetch next solution!
    if (e.key === ';' && hasMore) {
      e.preventDefault();
      onNextSolution();
      return;
    }

    // Ctrl+Enter or Cmd+Enter or Enter to execute
    if (e.key === 'Enter') {
      e.preventDefault();
      onRunQuery();
      setHistoryIndex(-1);
      return;
    }

    // History navigation with ArrowUp and ArrowDown
    if (e.key === 'ArrowUp') {
      if (history.length > 0) {
        e.preventDefault();
        const nextIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIdx);
        onChangeQuery(history[nextIdx].query);
      }
    } else if (e.key === 'ArrowDown') {
      if (history.length > 0) {
        e.preventDefault();
        const nextIdx = Math.max(historyIndex - 1, -1);
        setHistoryIndex(nextIdx);
        onChangeQuery(nextIdx === -1 ? '' : history[nextIdx].query);
      }
    }
  };

  return (
    <div className="bg-prolog-panel border-t border-prolog-border p-3 flex flex-col space-y-2 select-none">
      {/* Quick Callable Queries Chips */}
      {quickQueries.length > 0 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-prolog-muted font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-prolog-accent" />
            Hızlı Sorgular:
          </span>
          {quickQueries.slice(0, 6).map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChangeQuery(q);
                if (inputRef.current) inputRef.current.focus();
              }}
              className="shrink-0 bg-prolog-card hover:bg-prolog-hover text-prolog-text border border-prolog-border px-2.5 py-0.5 rounded-full font-mono text-[11px] transition-all hover:border-prolog-accent"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Row */}
      <div className="relative flex items-center space-x-2">
        {/* Prompt Symbol */}
        <div 
          className="flex items-center space-x-1 pl-3 pr-2 py-2 bg-prolog-card rounded-l-xl border-y border-l border-prolog-border font-mono text-sm font-bold select-none"
          style={{ color: 'var(--accent-color)' }}
        >
          <span>?-</span>
        </div>

        {/* Input Box */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Prolog sorgunuzu yazın (örn: ancestor(abraham, X).)..."
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            className="w-full bg-prolog-card text-prolog-text placeholder-prolog-muted font-mono text-sm py-2 px-3 border-y border-prolog-border outline-none focus:border-prolog-accent transition-colors"
          />

          {/* Clear button if input not empty */}
          {query && (
            <button
              onClick={() => {
                onChangeQuery('');
                if (inputRef.current) inputRef.current.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-prolog-muted hover:text-prolog-text rounded"
              title="Temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Query History Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2.5 bg-prolog-card hover:bg-prolog-hover border-y border-prolog-border text-prolog-muted hover:text-prolog-text transition-colors ${
              showHistory ? 'text-prolog-accent bg-prolog-hover' : ''
            }`}
            title="Sorgu Geçmişi"
          >
            <History className="w-4 h-4" />
          </button>

          {/* History Popup */}
          {showHistory && (
            <div className="absolute right-0 bottom-full mb-2 w-72 max-h-60 overflow-y-auto bg-prolog-panel border border-prolog-border rounded-xl shadow-xl z-30 p-1.5 space-y-1">
              <div className="text-[11px] font-semibold text-prolog-muted px-2 py-1 border-b border-prolog-border flex items-center justify-between">
                <span>Son Sorgular</span>
                <span className="text-[10px] text-prolog-muted">({history.length})</span>
              </div>
              {history.length === 0 ? (
                <div className="p-3 text-center text-xs text-prolog-muted italic">
                  Henüz geçmiş sorgu yok.
                </div>
              ) : (
                history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectHistory(item.query);
                      setShowHistory(false);
                    }}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-prolog-hover flex items-center justify-between text-xs font-mono text-prolog-text transition-colors"
                  >
                    <span className="truncate">?- {item.query}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded font-sans ml-2 ${
                      item.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {item.success ? '✓' : '✗'}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Run Query Button */}
        <button
          onClick={onRunQuery}
          disabled={isQuerying || !query.trim()}
          style={{ backgroundColor: 'var(--accent-color)' }}
          className="flex items-center space-x-1.5 hover:opacity-90 active:scale-95 text-white font-medium text-xs px-4 py-2.5 rounded-r-xl shadow-md transition-all disabled:opacity-50 select-none"
          title="Sorguyu Çalıştır (Enter)"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isQuerying ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isQuerying ? 'Çalışıyor' : 'Sorgula'}</span>
          <CornerDownLeft className="w-3 h-3 text-white/80 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
