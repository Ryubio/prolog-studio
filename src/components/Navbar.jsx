import React from 'react';
import { 
  Play, 
  RotateCcw, 
  BookOpen, 
  Layers, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu,
  Sparkles,
  Palette
} from 'lucide-react';

export default function Navbar({
  isCompiling,
  compileStatus,
  onConsult,
  onReset,
  onOpenExamples,
  onOpenCheatSheet,
  onOpenTheme,
  onExportFile,
  onImportFile,
  activeFilename
}) {
  return (
    <header className="h-14 border-b border-prolog-border bg-prolog-panel px-4 flex items-center justify-between z-20 select-none">
      {/* Left: Logo & Engine Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg text-white font-bold text-lg"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            λ
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-prolog-text">
                PrologStudio
              </span>
              <span 
                className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border flex items-center gap-1"
                style={{ 
                  color: 'var(--accent-color)', 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-card)' 
                }}
              >
                <Cpu className="w-2.5 h-2.5" />
                SWI-Prolog WASM
              </span>
            </div>
          </div>
        </div>

        {/* Compile Status Pill */}
        <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-prolog-border">
          {compileStatus === 'clean' && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hazır & Derlendi</span>
            </div>
          )}
          {compileStatus === 'dirty' && (
            <div className="flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Değişiklik var (Ctrl+S ile Derle)</span>
            </div>
          )}
          {compileStatus === 'error' && (
            <div className="flex items-center space-x-1.5 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Derleme Hatası</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        {/* Main Consult Button */}
        <button
          onClick={onConsult}
          disabled={isCompiling}
          title="Kodu derle ve Prolog çalışma alanına yükle (Ctrl+S)"
          style={{ backgroundColor: 'var(--accent-color)' }}
          className="flex items-center space-x-2 hover:opacity-90 active:scale-95 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-md transition-all duration-150 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
          <span>{isCompiling ? 'Derleniyor...' : 'Kodu Derle (Ctrl+S)'}</span>
        </button>

        {/* Examples Button */}
        <button
          onClick={onOpenExamples}
          className="flex items-center space-x-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text text-xs px-3 py-1.5 rounded-lg border border-prolog-border transition-colors"
          title="Hazır Prolog projeleri ve örnekleri"
        >
          <Layers className="w-3.5 h-3.5 text-prolog-accent" />
          <span className="hidden sm:inline">Örnekler</span>
        </button>

        {/* Cheat Sheet Button */}
        <button
          onClick={onOpenCheatSheet}
          className="flex items-center space-x-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text text-xs px-3 py-1.5 rounded-lg border border-prolog-border transition-colors"
          title="Prolog Sözdizimi ve Yüklemler Kılavuzu"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Rehber</span>
        </button>

        {/* Theme & Color Customizer Button */}
        <button
          onClick={onOpenTheme}
          className="flex items-center space-x-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text text-xs px-3 py-1.5 rounded-lg border border-prolog-border transition-colors"
          title="Tema ve Renkleri Özelleştir"
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">Tema</span>
        </button>

        {/* Reset Engine Button */}
        <button
          onClick={onReset}
          className="p-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-muted hover:text-rose-400 rounded-lg border border-prolog-border transition-colors"
          title="Prolog Motorunu Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* File Export / Import */}
        <div className="h-4 w-[1px] bg-prolog-border mx-1"></div>

        <button
          onClick={onExportFile}
          className="p-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text rounded-lg border border-prolog-border transition-colors"
          title={`${activeFilename} dosyasını bilgisayarına indir`}
        >
          <Download className="w-4 h-4" />
        </button>

        <label
          className="p-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text rounded-lg border border-prolog-border transition-colors cursor-pointer"
          title=".pl dosyası yükle"
        >
          <Upload className="w-4 h-4" />
          <input
            type="file"
            accept=".pl,.pro,.prolog"
            onChange={onImportFile}
            className="hidden"
          />
        </label>
      </div>
    </header>
  );
}
