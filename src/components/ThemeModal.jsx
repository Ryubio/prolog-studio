import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Eye,
  Sun,
  Moon
} from 'lucide-react';
import { PRESET_THEMES, DEFAULT_THEME } from '../data/themes';

export default function ThemeModal({
  isOpen,
  onClose,
  currentTheme,
  onApplyTheme,
  onResetTheme
}) {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'
  const [customValues, setCustomValues] = useState(currentTheme.values);

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setCustomValues(preset.values);
    onApplyTheme(preset);
  };

  const handleColorChange = (key, value) => {
    const updated = { ...customValues, [key]: value };
    setCustomValues(updated);
    onApplyTheme({
      id: 'custom',
      name: 'Özel Renkler',
      category: 'Özel',
      previewColor: updated.accentColor,
      bgPreview: updated.bgPrimary,
      values: updated
    });
  };

  const COLOR_FIELDS = [
    { key: 'accentColor', label: 'Vurgu Rengi (Accent)', desc: 'Butonlar, aktif sekmeler, parlamalar' },
    { key: 'colorVariable', label: 'Değişken Rengi (Variables)', desc: 'Prolog değişkenleri (X, Parent, Result)' },
    { key: 'colorAtom', label: 'Atom Rengi (Atoms)', desc: 'Prolog atomları (elma, abraham, isaac)' },
    { key: 'colorPredicate', label: 'Yüklem Rengi (Predicates)', desc: 'Yüklemler ve direktifler (ancestor, :-)' },
    { key: 'colorOperator', label: 'Operatör Rengi (Operators)', desc: 'Eşitleme, aritmetik ve kesme (=, is, !)' },
    { key: 'bgPrimary', label: 'Ana Zemin (Background)', desc: 'Uygulama arka planı' },
    { key: 'bgPanel', label: 'Panel Zemin (Panels)', desc: 'Üst menü, sekmeler ve araç çubukları' },
    { key: 'bgCard', label: 'Kart Zemin (Cards)', desc: 'Çözüm kartları, tablolar ve pencereler' },
    { key: 'borderColor', label: 'Kenarlık Rengi (Borders)', desc: 'Bölmeler ve kutu çerçeveleri' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-prolog-panel border border-prolog-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-prolog-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-prolog-card text-prolog-accent border border-prolog-border">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-prolog-text">Tema ve Renk Özelleştirme</h2>
              <p className="text-xs text-prolog-muted">Hazır temalardan birini seçin veya renkleri elle belirleyin.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-prolog-muted hover:text-prolog-text hover:bg-prolog-card rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Presets vs Custom */}
        <div className="px-6 py-3 border-b border-prolog-border bg-prolog-card/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'presets'
                  ? 'bg-prolog-accent text-white shadow-sm'
                  : 'text-prolog-muted hover:text-prolog-text hover:bg-prolog-hover'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hazır Temalar ({PRESET_THEMES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'custom'
                  ? 'bg-prolog-accent text-white shadow-sm'
                  : 'text-prolog-muted hover:text-prolog-text hover:bg-prolog-hover'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Elle Renk Seçimi</span>
            </button>
          </div>

          <button
            onClick={onResetTheme}
            className="flex items-center space-x-1.5 text-xs text-prolog-muted hover:text-rose-400 p-1.5 rounded-lg hover:bg-prolog-hover transition-colors"
            title="Varsayılan temaya geri dön"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Varsayılana Sıfırla</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'presets' ? (
            /* Presets Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PRESET_THEMES.map((theme) => {
                const isSelected = currentTheme.id === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectPreset(theme)}
                    className={`group cursor-pointer p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-prolog-accent bg-prolog-card shadow-md'
                        : 'border-prolog-border bg-prolog-card/60 hover:bg-prolog-hover hover:border-prolog-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-2.5">
                        {/* Swatch Circle */}
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm shrink-0"
                          style={{ backgroundColor: theme.previewColor }}
                        />
                        <span className="text-sm font-bold text-prolog-text group-hover:text-prolog-accent transition-colors">
                          {theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="p-1 rounded-full bg-prolog-accent text-white">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Miniature Palette Preview */}
                    <div
                      className="h-10 rounded-lg p-2 flex items-center space-x-2 border border-white/5"
                      style={{ backgroundColor: theme.bgPreview }}
                    >
                      <div
                        className="h-4 w-12 rounded text-[9px] font-mono font-bold flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.values.accentColor }}
                      >
                        ?- Run
                      </div>
                      <div
                        className="h-3 w-8 rounded text-[9px] font-mono flex items-center justify-center"
                        style={{ color: theme.values.colorVariable }}
                      >
                        X = 42
                      </div>
                      <div
                        className="h-3 w-8 rounded text-[9px] font-mono flex items-center justify-center"
                        style={{ color: theme.values.colorAtom }}
                      >
                        isaac
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Colors Picker List */
            <div className="space-y-4">
              <div className="text-xs text-prolog-muted bg-prolog-card p-3 rounded-xl border border-prolog-border">
                💡 İstediğiniz rengin kutucuğuna tıklayarak renk tekerleğinden seçim yapabilir veya doğrudan HEX kodunu girebilirsiniz. Yaptığınız tüm değişiklikler anında kaydedilir.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COLOR_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-prolog-card border border-prolog-border hover:border-prolog-muted/30 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-prolog-text">{field.label}</div>
                      <div className="text-[11px] text-prolog-muted">{field.desc}</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-prolog-muted uppercase">
                        {customValues[field.key]}
                      </span>
                      <input
                        type="color"
                        value={customValues[field.key]}
                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-prolog-border bg-prolog-card/30 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-prolog-accent hover:opacity-90 text-white font-medium text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Tamam & Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
