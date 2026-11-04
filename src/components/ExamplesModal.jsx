import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Layers, 
  Play, 
  Users, 
  Network, 
  Crown, 
  Boxes, 
  BookOpen, 
  Grid, 
  HelpCircle, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { EXAMPLES } from '../data/examples';

const ICON_MAP = {
  Users,
  Network,
  Crown,
  Boxes,
  BookOpen,
  Grid,
  HelpCircle,
  ShieldAlert
};

export default function ExamplesModal({ isOpen, onClose, onLoadExample }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(EXAMPLES.map(e => e.category)))];

  const filtered = EXAMPLES.filter(e => {
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.description.toLowerCase().includes(search.toLowerCase()) ||
                          e.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-prolog-panel border border-prolog-border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-prolog-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Hazır Prolog Projeleri & Şablonlar</h2>
              <p className="text-xs text-slate-400">Çalışmak istediğiniz örneği seçip tek tıkla yükleyin.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-prolog-border bg-slate-900/40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Categories */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'Tümü' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Örneklerde ara..."
              className="bg-slate-900 text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-700/80 focus:border-indigo-500 text-slate-200 outline-none w-full sm:w-56"
            />
          </div>
        </div>

        {/* Examples Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(ex => {
            const Icon = ICON_MAP[ex.icon] || Layers;
            return (
              <div
                key={ex.id}
                className="group relative bg-prolog-card hover:bg-prolog-hover border border-prolog-border/80 hover:border-indigo-500/40 rounded-xl p-4 flex flex-col justify-between transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/5"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {ex.title}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium">{ex.category}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {ex.description}
                  </p>

                  {/* Sample Query Hint */}
                  <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/80 text-[11px] font-mono text-slate-300 flex items-center justify-between mb-4">
                    <span className="text-indigo-400 truncate">?- {ex.defaultQuery}</span>
                  </div>
                </div>

                {/* Load Button */}
                <button
                  onClick={() => {
                    onLoadExample(ex);
                    onClose();
                  }}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
                >
                  <span>Çalışma Alanına Yükle & Derle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
