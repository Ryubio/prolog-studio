import React, { useRef, useEffect, useState } from 'react';
import { 
  FileCode, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  ListTree, 
  Terminal, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { highlightProlog } from '../utils/prologHighlighter';

export default function Editor({
  files,
  activeFilename,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  code,
  onChangeCode,
  onConsult,
  compileError,
  predicates = [],
  onInsertQuery
}) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [showOutline, setShowOutline] = useState(true);
  const [newFilePrompt, setNewFilePrompt] = useState(false);
  const [newFileNameInput, setNewFileNameInput] = useState('');

  // Synchronize scrolling between textarea, highlight backdrop, and line numbers
  const handleScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollLeft = scrollLeft;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
      }
    }
  };

  // Keyboard shortcuts and smart indentation
  const handleKeyDown = (e) => {
    // Ctrl+S or Cmd+S to consult
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onConsult();
      return;
    }

    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChangeCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Enter preserves indentation
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const currentLine = code.substring(0, start).split('\n').pop();
      const match = currentLine.match(/^(\s+)/);
      const indent = match ? match[1] : '';

      // If the line ended with ':-' or '-->', add extra 2 spaces indentation
      const extraIndent = (/(:-|-->)\s*$/.test(currentLine.trim())) ? '  ' : '';
      const fullIndent = indent + extraIndent;

      if (fullIndent.length > 0) {
        e.preventDefault();
        const newCode = code.substring(0, start) + '\n' + fullIndent + code.substring(textarea.selectionEnd);
        onChangeCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + fullIndent.length;
        }, 0);
      }
    }
  };

  const linesCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  const jumpToLine = (lineNum) => {
    if (!textareaRef.current) return;
    const lines = code.split('\n');
    let charIndex = 0;
    for (let i = 0; i < Math.min(lineNum - 1, lines.length); i++) {
      charIndex += lines[i].length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIndex, charIndex + (lines[lineNum - 1]?.length || 0));
    
    // Scroll to line
    const approxLineHeight = 21;
    textareaRef.current.scrollTop = Math.max(0, (lineNum - 5) * approxLineHeight);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newFileNameInput.trim()) {
      onCreateFile(newFileNameInput.trim());
      setNewFileNameInput('');
      setNewFilePrompt(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-prolog-bg overflow-hidden border-r border-prolog-border">
      {/* File Tabs Bar */}
      <div className="flex items-center justify-between bg-prolog-panel border-b border-prolog-border px-2 pt-1 select-none">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {files.map((file) => (
            <div
              key={file.name}
              onClick={() => onSelectFile(file.name)}
              className={`group flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-t-md transition-all cursor-pointer ${
                activeFilename === file.name
                  ? 'bg-prolog-bg text-prolog-text border-t-2 border-prolog-accent shadow-sm'
                  : 'text-prolog-muted hover:text-prolog-text hover:bg-prolog-hover'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-prolog-accent" />
              <span>{file.name}</span>
              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.name);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
                  title="Dosyayı Sil"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Add New File Button */}
          {newFilePrompt ? (
            <form onSubmit={handleCreateSubmit} className="flex items-center space-x-1 px-2 py-1">
              <input
                type="text"
                value={newFileNameInput}
                onChange={(e) => setNewFileNameInput(e.target.value)}
                placeholder="yeni_dosya.pl"
                autoFocus
                className="bg-prolog-card text-xs px-2 py-1 rounded border border-prolog-accent text-prolog-text outline-none w-28"
              />
              <button
                type="submit"
                className="text-xs bg-prolog-accent hover:opacity-90 text-white px-2 py-1 rounded"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setNewFilePrompt(false)}
                className="text-xs text-prolog-muted hover:text-prolog-text px-1"
              >
                İptal
              </button>
            </form>
          ) : (
            <button
              onClick={() => setNewFilePrompt(true)}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-prolog-muted hover:text-prolog-accent hover:bg-prolog-hover rounded transition-colors"
              title="Yeni .pl dosyası oluştur"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Toggle Predicate Outline Button */}
        <button
          onClick={() => setShowOutline(!showOutline)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
            showOutline ? 'text-prolog-accent bg-prolog-card' : 'text-prolog-muted hover:text-prolog-text'
          }`}
          title="Yüklem İndeksini Göster / Gizle"
        >
          <ListTree className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Yüklemler ({predicates.length})</span>
        </button>
      </div>

      {/* Editor Main Body: Code & Optional Outline */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-prolog-panel/60 border-r border-prolog-border py-3 pr-2 text-right font-mono text-xs text-prolog-muted select-none overflow-hidden shrink-0"
        >
          {lineNumbers.map((num) => (
            <div key={num} className="leading-[21px] h-[21px] hover:text-prolog-text cursor-pointer" onClick={() => jumpToLine(num)}>
              {num}
            </div>
          ))}
        </div>

        {/* Code Container: Overlay Syntax Highlighting + Transparent Textarea */}
        <div className="flex-1 relative overflow-hidden bg-prolog-bg">
          {/* Highlighted Backdrop */}
          <pre
            ref={highlightRef}
            aria-hidden="true"
            className="absolute inset-0 m-0 py-3 px-4 font-mono text-[13px] leading-[21px] whitespace-pre overflow-hidden pointer-events-none select-none text-prolog-text"
            dangerouslySetInnerHTML={{ __html: highlightProlog(code) + '\n' }}
          />

          {/* Interactive Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            style={{ caretColor: 'var(--accent-color)' }}
            className="absolute inset-0 m-0 py-3 px-4 font-mono text-[13px] leading-[21px] whitespace-pre bg-transparent text-transparent resize-none outline-none border-none overflow-auto z-10 selection:bg-prolog-accent/30 selection:text-transparent"
          />
        </div>

        {/* Collapsible Predicate Outline Sidebar */}
        {showOutline && (
          <aside className="w-56 bg-prolog-panel border-l border-prolog-border flex flex-col overflow-hidden shrink-0 select-none">
            <div className="px-3 py-2 border-b border-prolog-border flex items-center justify-between text-xs font-semibold text-prolog-text">
              <span className="flex items-center gap-1.5">
                <ListTree className="w-3.5 h-3.5 text-prolog-accent" />
                Tanımlı Yüklemler
              </span>
              <span className="text-[10px] bg-prolog-card text-prolog-muted px-1.5 py-0.5 rounded border border-prolog-border">
                {predicates.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {predicates.length === 0 ? (
                <div className="p-3 text-center text-xs text-prolog-muted italic">
                  Kodda henüz bir yüklem tanımlanmadı.
                </div>
              ) : (
                predicates.map((p) => (
                  <div
                    key={p.key}
                    className="group flex items-center justify-between p-1.5 rounded-md hover:bg-prolog-card text-xs text-prolog-text transition-colors"
                  >
                    <button
                      onClick={() => jumpToLine(p.line)}
                      className="flex items-center space-x-1.5 text-left truncate flex-1 hover:text-prolog-accent"
                      title={`Satır ${p.line}'e git`}
                    >
                      <span className="font-mono text-prolog-accent font-semibold">{p.name}</span>
                      <span className="text-[11px] text-prolog-muted">/{p.arity}</span>
                      {p.clausesCount > 1 && (
                        <span className="text-[10px] bg-prolog-card text-prolog-muted px-1 rounded ml-1 border border-prolog-border">
                          x{p.clausesCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => onInsertQuery(p.sampleQuery)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] bg-prolog-card hover:bg-prolog-hover text-prolog-accent border border-prolog-border px-1.5 py-0.5 rounded transition-all font-mono"
                      title={`?- ${p.sampleQuery} sorgusunu konsola aktar`}
                    >
                      ?-
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Compiler Error Overlay Banner */}
      {compileError && (
        <div className="bg-rose-950/80 border-t border-rose-500/30 px-4 py-2.5 flex items-start space-x-2 text-rose-200 text-xs select-text">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-mono overflow-x-auto whitespace-pre-wrap">
            {compileError}
          </div>
        </div>
      )}
    </div>
  );
}
