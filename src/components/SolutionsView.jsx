import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Table, 
  LayoutGrid, 
  FastForward, 
  Play, 
  StopCircle, 
  Clock, 
  HelpCircle,
  XCircle,
  CheckCircle2
} from 'lucide-react';

export default function SolutionsView({
  solutions = [],
  hasMore = false,
  isQuerying = false,
  executionTimeMs = 0,
  onNext,
  onNextBatch,
  onAll,
  onStop,
  queryFailed = false,
  error = null
}) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (solution, index) => {
    navigator.clipboard.writeText(JSON.stringify(solution, null, 2));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-text">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 text-rose-400">
          <XCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-rose-300 mb-1">Sorgu Hatası</h3>
        <p className="text-xs text-rose-400/80 font-mono max-w-md bg-rose-950/40 p-3 rounded-lg border border-rose-500/20 whitespace-pre-wrap">
          {error}
        </p>
      </div>
    );
  }

  if (queryFailed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 text-rose-400">
          <span className="font-mono text-xl font-bold">✗</span>
        </div>
        <h3 className="text-sm font-bold text-rose-400 mb-1 font-mono">false.</h3>
        <p className="text-xs text-prolog-muted max-w-sm">
          Sorgu kanıtlanamadı veya çözüm bulunamadı.
        </p>
        {executionTimeMs !== undefined && (
          <span className="text-[11px] text-prolog-muted flex items-center gap-1 mt-2">
            <Clock className="w-3 h-3" />
            {executionTimeMs} ms
          </span>
        )}
      </div>
    );
  }

  if (solutions.length === 0 && !isQuerying) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-prolog-muted select-none">
        <HelpCircle className="w-10 h-10 mb-2 stroke-[1.5] text-prolog-muted/60" />
        <p className="text-xs">Çözüm sonuçları burada görüntülenecek.</p>
        <p className="text-[11px] text-prolog-muted/80 mt-1">Aşağıdaki çubuğa bir sorgu yazıp (?- ...) Ctrl+Enter'a basın.</p>
      </div>
    );
  }

  // Check if solutions are pure truth values (_truth: true)
  const isPureTruth = solutions.length === 1 && solutions[0]._truth;
  
  // Extract variable keys (excluding internal _truth)
  const varKeys = solutions.length > 0
    ? Object.keys(solutions[0]).filter(k => k !== '_truth')
    : [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-prolog-bg">
      {/* Top Controls Bar */}
      <div className="px-4 py-2 bg-prolog-panel border-b border-prolog-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-prolog-text">
            {solutions.length} {solutions.length === 1 ? 'Çözüm' : 'Çözüm'}
            {hasMore ? ' (Devamı var)' : ' (Tamamlandı)'}
          </span>
          <span className="text-prolog-muted flex items-center gap-1 text-[11px]">
            <Clock className="w-3 h-3" />
            {executionTimeMs} ms
          </span>
        </div>

        {/* View Mode Toggle */}
        {!isPureTruth && varKeys.length > 0 && (
          <div className="flex items-center space-x-1 bg-prolog-card p-0.5 rounded-lg border border-prolog-border">
            <button
              onClick={() => setViewMode('cards')}
              style={{ backgroundColor: viewMode === 'cards' ? 'var(--accent-color)' : 'transparent' }}
              className={`p-1 rounded ${
                viewMode === 'cards' ? 'text-white shadow-sm' : 'text-prolog-muted hover:text-prolog-text'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{ backgroundColor: viewMode === 'table' ? 'var(--accent-color)' : 'transparent' }}
              className={`p-1 rounded ${
                viewMode === 'table' ? 'text-white shadow-sm' : 'text-prolog-muted hover:text-prolog-text'
              }`}
              title="Tablo Görünümü"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Solutions Container */}
      <div className="flex-1 overflow-y-auto p-4 select-text space-y-3">
        {isPureTruth ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-base font-bold text-emerald-400">true.</div>
              <div className="text-xs text-emerald-400/80">Sorgu başarıyla doğrulandı (Değişken bağlaması yok).</div>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards View */
          <div className="space-y-2.5">
            {solutions.map((sol, idx) => (
              <div
                key={idx}
                className="group relative bg-prolog-card hover:bg-prolog-hover border border-prolog-border rounded-xl p-3.5 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border"
                    style={{ 
                      color: 'var(--accent-color)', 
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-panel)' 
                    }}
                  >
                    Çözüm #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleCopy(sol, idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-prolog-muted hover:text-prolog-text hover:bg-prolog-panel rounded transition-all"
                    title="Bu çözümü kopyala"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Variable Bindings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(sol)
                    .filter(([k]) => k !== '_truth')
                    .map(([variable, val]) => (
                      <div
                        key={variable}
                        className="flex items-center space-x-2 bg-prolog-panel px-3 py-2 rounded-lg border border-prolog-border font-mono text-xs"
                      >
                        <span style={{ color: 'var(--color-variable)' }} className="font-bold">{variable}</span>
                        <span className="text-prolog-muted">=</span>
                        <span style={{ color: 'var(--color-atom)' }} className="truncate select-all">{val}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto rounded-lg border border-prolog-border">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-prolog-panel text-prolog-muted border-b border-prolog-border">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center text-prolog-muted">#</th>
                  {varKeys.map((key) => (
                    <th key={key} style={{ color: 'var(--color-variable)' }} className="py-2.5 px-3 font-bold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-prolog-border/50">
                {solutions.map((sol, idx) => (
                  <tr key={idx} className="hover:bg-prolog-hover transition-colors">
                    <td className="py-2 px-3 text-center text-prolog-muted font-semibold">{idx + 1}</td>
                    {varKeys.map((key) => (
                      <td key={key} style={{ color: 'var(--color-atom)' }} className="py-2 px-3 select-all">
                        {sol[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stepper Action Bar (Sonraki, 10 Tane, Tümünü Getir, Durdur) */}
      {hasMore && (
        <div className="px-4 py-2.5 bg-prolog-panel border-t border-prolog-border flex items-center justify-between text-xs select-none">
          <div className="flex items-center space-x-2">
            {/* Next 1 Solution */}
            <button
              onClick={onNext}
              disabled={isQuerying}
              style={{ backgroundColor: 'var(--accent-color)' }}
              className="flex items-center space-x-1.5 hover:opacity-90 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
              title="Sonraki çözümü getir (klavyede ; veya Boşluk)"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Sonraki (;)</span>
            </button>

            {/* Next 10 Solutions */}
            <button
              onClick={onNextBatch}
              disabled={isQuerying}
              className="flex items-center space-x-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text px-3 py-1.5 rounded-lg border border-prolog-border transition-colors disabled:opacity-50"
            >
              <FastForward className="w-3.5 h-3.5 text-prolog-accent" />
              <span>+10 Çözüm</span>
            </button>

            {/* All Solutions */}
            <button
              onClick={onAll}
              disabled={isQuerying}
              className="bg-prolog-card hover:bg-prolog-hover text-prolog-text px-3 py-1.5 rounded-lg border border-prolog-border transition-colors disabled:opacity-50"
              title="Kalan tüm çözümleri topla"
            >
              Tümü (*)
            </button>
          </div>

          {/* Stop / Close Query */}
          <button
            onClick={onStop}
            className="flex items-center space-x-1 text-prolog-muted hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-prolog-card transition-colors"
            title="Aramayı sonlandır"
          >
            <StopCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Durdur</span>
          </button>
        </div>
      )}
    </div>
  );
}
