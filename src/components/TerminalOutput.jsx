import React, { useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, Check } from 'lucide-react';

export default function TerminalOutput({ stdout = '', stderr = '', onClear }) {
  const terminalRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [stdout, stderr]);

  const handleCopy = () => {
    const fullText = (stdout ? stdout + '\n' : '') + (stderr || '');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasContent = stdout.trim() || stderr.trim();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] font-mono text-xs overflow-hidden select-text">
      {/* Top Bar */}
      <div className="px-4 py-2 bg-prolog-panel/70 border-b border-prolog-border flex items-center justify-between text-slate-400 select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">Terminal & Standart Çıktı</span>
        </div>

        <div className="flex items-center space-x-1.5">
          {hasContent && (
            <>
              <button
                onClick={handleCopy}
                className="p-1 hover:text-slate-200 text-slate-400 hover:bg-slate-800 rounded transition-colors"
                title="Çıktıyı Kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onClear}
                className="p-1 hover:text-slate-200 text-slate-400 hover:bg-slate-800 rounded transition-colors"
                title="Temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto space-y-2">
        {!hasContent ? (
          <div className="text-slate-600 select-none italic text-center py-8">
            Prolog write/1, writeln/1 veya format/2 çıktıları burada görünecektir.
          </div>
        ) : (
          <>
            {stdout && (
              <div className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                {stdout}
              </div>
            )}
            {stderr && (
              <div className="text-rose-400 whitespace-pre-wrap leading-relaxed border-t border-rose-900/40 pt-2">
                {stderr}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
