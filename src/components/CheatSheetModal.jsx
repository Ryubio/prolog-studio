import React, { useState } from 'react';
import { X, Search, BookOpen, Copy, Check, Terminal } from 'lucide-react';
import { CHEAT_SHEET } from '../data/cheatSheet';
import { highlightProlog } from '../utils/prologHighlighter';

export default function CheatSheetModal({ isOpen, onClose, onInsertCode }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const currentCategory = CHEAT_SHEET[activeTab];

  const searchResults = search.trim()
    ? CHEAT_SHEET.flatMap(cat => 
        cat.items.filter(item => 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.code.toLowerCase().includes(search.toLowerCase())
        ).map(item => ({ ...item, category: cat.category }))
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-prolog-panel border border-prolog-border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-prolog-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Prolog Başvuru Kılavuzu & Sözdizimi</h2>
              <p className="text-xs text-slate-400">Prolog dilinin temel yapıları, operatörleri ve standart yüklemleri.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Navigation */}
        <div className="px-6 py-3 border-b border-prolog-border bg-slate-900/40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {!searchResults && (
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {CHEAT_SHEET.map((cat, idx) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveTab(idx)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === idx
                      ? 'bg-amber-600/90 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          )}

          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kılavuzda ara (örn: cut, is, findall)..."
              className="bg-slate-900 text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-700/80 focus:border-amber-500 text-slate-200 outline-none w-full sm:w-64"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(searchResults || currentCategory.items).map((item, idx) => (
            <div
              key={idx}
              className="bg-prolog-card border border-prolog-border rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    {item.title}
                    {item.category && (
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.category}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-4">
                  <button
                    onClick={() => handleCopy(item.code, `${idx}`)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                    title="Kodu Kopyala"
                  >
                    {copiedIndex === `${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code Snippet Box with Syntax Highlighting */}
              <div className="relative mt-2 bg-slate-950 rounded-lg p-3 border border-slate-800/80 font-mono text-xs overflow-x-auto select-text">
                <pre
                  dangerouslySetInnerHTML={{ __html: highlightProlog(item.code) }}
                  className="m-0 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
