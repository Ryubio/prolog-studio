import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Editor from './components/Editor';
import SolutionsView from './components/SolutionsView';
import QueryConsole from './components/QueryConsole';
import KnowledgeGraph from './components/KnowledgeGraph';
import TerminalOutput from './components/TerminalOutput';
import ExamplesModal from './components/ExamplesModal';
import CheatSheetModal from './components/CheatSheetModal';
import ThemeModal from './components/ThemeModal';
import { PRESET_THEMES, DEFAULT_THEME } from './data/themes';
import { 
  Code2, 
  Network, 
  CheckCircle2, 
  Terminal, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export default function App() {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('prolog_studio_custom_theme');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_THEME;
  });
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Apply theme CSS variables to :root
  useEffect(() => {
    const root = document.documentElement;
    const v = currentTheme.values;
    if (!v) return;

    root.style.setProperty('--bg-primary', v.bgPrimary);
    root.style.setProperty('--bg-panel', v.bgPanel);
    root.style.setProperty('--bg-card', v.bgCard);
    root.style.setProperty('--bg-hover', v.bgHover);
    root.style.setProperty('--border-color', v.borderColor);
    root.style.setProperty('--accent-color', v.accentColor);
    root.style.setProperty('--accent-hover', v.accentHover);
    root.style.setProperty('--text-main', v.textMain);
    root.style.setProperty('--text-muted', v.textMuted);
    root.style.setProperty('--color-variable', v.colorVariable);
    root.style.setProperty('--color-atom', v.colorAtom);
    root.style.setProperty('--color-predicate', v.colorPredicate);
    root.style.setProperty('--color-string', v.colorString);
    root.style.setProperty('--color-operator', v.colorOperator);
    root.style.setProperty('--color-comment', v.colorComment);
  }, [currentTheme]);

  const handleApplyTheme = (theme) => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem('prolog_studio_custom_theme', JSON.stringify(theme));
    } catch (e) {}
  };

  const handleResetTheme = () => {
    setCurrentTheme(DEFAULT_THEME);
    try {
      localStorage.removeItem('prolog_studio_custom_theme');
    } catch (e) {}
  };

  // Workspace & Files State
  const [files, setFiles] = useState([{ name: 'main.pl' }]);
  const [activeFilename, setActiveFilename] = useState('main.pl');
  const [code, setCode] = useState('');
  
  // Compiler State
  const [compileStatus, setCompileStatus] = useState('clean'); // 'clean' | 'dirty' | 'error'
  const [compileError, setCompileError] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [predicates, setPredicates] = useState([]);
  const [facts, setFacts] = useState([]);

  // Navigation Tabs
  const [leftTab, setLeftTab] = useState('editor'); // 'editor' | 'graph'
  const [rightTab, setRightTab] = useState('solutions'); // 'solutions' | 'terminal'

  // Query & REPL State
  const [query, setQuery] = useState('ancestor(abraham, Kim).');
  const [solutions, setSolutions] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [activeQueryId, setActiveQueryId] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryFailed, setQueryFailed] = useState(false);
  const [queryError, setQueryError] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(0);

  // Terminal Buffers
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [history, setHistory] = useState([]);

  // Modals
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // Initial Load: Fetch workspace files and status
  useEffect(() => {
    loadWorkspaceFiles();
  }, []);

  const loadWorkspaceFiles = async () => {
    try {
      const res = await fetch('/api/workspace');
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        setFiles(data.files);
        // Load the first file
        const target = data.files[0].name;
        setActiveFilename(target);
        loadFileContent(target);
      }
    } catch (err) {
      console.error('Workspace files load error:', err);
    }
  };

  const loadFileContent = async (filename) => {
    try {
      const res = await fetch(`/api/workspace/${filename}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setCode(data.content);
        handleConsultCode(data.content, filename);
      }
    } catch (err) {
      console.error('File load error:', err);
    }
  };

  // Consult code to backend SWIPL
  const handleConsultCode = async (codeToConsult = code, filename = activeFilename) => {
    setIsCompiling(true);
    setCompileError(null);

    try {
      // 1. Save to workspace
      await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: codeToConsult })
      });

      // 2. Consult in SWIPL
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToConsult, filename })
      });
      const data = await res.json();

      setIsCompiling(false);
      if (data.predicates) setPredicates(data.predicates);
      if (data.facts) setFacts(data.facts);
      if (data.stdout) setStdout(prev => (prev ? prev + '\n' + data.stdout : data.stdout));

      if (data.success) {
        setCompileStatus('clean');
        setCompileError(null);
      } else {
        setCompileStatus('error');
        setCompileError(data.error || data.stderr || 'Derleme hatası.');
      }
    } catch (err) {
      setIsCompiling(false);
      setCompileStatus('error');
      setCompileError(err.message);
    }
  };

  // Run Query
  const handleRunQuery = async (queryToRun = query) => {
    if (!queryToRun.trim()) return;

    setIsQuerying(true);
    setQueryFailed(false);
    setQueryError(null);
    setRightTab('solutions');

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToRun, limit: 5 })
      });
      const data = await res.json();

      setIsQuerying(false);
      setExecutionTimeMs(data.executionTimeMs || 0);
      if (data.stdout) setStdout(prev => (prev ? prev + '\n' + data.stdout : data.stdout));
      if (data.stderr) setStderr(prev => (prev ? prev + '\n' + data.stderr : data.stderr));

      if (data.error) {
        setQueryError(data.error);
        setSolutions([]);
        setHasMore(false);
        setActiveQueryId(null);
        recordHistory(queryToRun, false);
        return;
      }

      if (data.solutions && data.solutions.length > 0) {
        setSolutions(data.solutions);
        setHasMore(data.hasMore);
        setActiveQueryId(data.queryId);
        recordHistory(queryToRun, true);
      } else {
        // Query failed (false)
        setSolutions([]);
        setHasMore(false);
        setActiveQueryId(null);
        setQueryFailed(true);
        recordHistory(queryToRun, false);
      }
    } catch (err) {
      setIsQuerying(false);
      setQueryError(err.message);
      recordHistory(queryToRun, false);
    }
  };

  // Next Solution (;)
  const handleNextSolution = async () => {
    if (!activeQueryId) return;

    setIsQuerying(true);
    try {
      const res = await fetch('/api/query/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId: activeQueryId, count: 1 })
      });
      const data = await res.json();

      setIsQuerying(false);
      if (data.executionTimeMs) setExecutionTimeMs(data.executionTimeMs);
      if (data.stdout) setStdout(prev => (prev ? prev + '\n' + data.stdout : data.stdout));

      if (data.solutions && data.solutions.length > 0) {
        setSolutions(prev => [...prev, ...data.solutions]);
        setHasMore(data.hasMore);
        if (!data.hasMore) setActiveQueryId(null);
      } else {
        setHasMore(false);
        setActiveQueryId(null);
      }
    } catch (err) {
      setIsQuerying(false);
      setQueryError(err.message);
    }
  };

  // Next 10 Solutions
  const handleNextBatch = async () => {
    if (!activeQueryId) return;

    setIsQuerying(true);
    try {
      const res = await fetch('/api/query/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId: activeQueryId, count: 10 })
      });
      const data = await res.json();

      setIsQuerying(false);
      if (data.executionTimeMs) setExecutionTimeMs(data.executionTimeMs);
      if (data.stdout) setStdout(prev => (prev ? prev + '\n' + data.stdout : data.stdout));

      if (data.solutions && data.solutions.length > 0) {
        setSolutions(prev => [...prev, ...data.solutions]);
        setHasMore(data.hasMore);
        if (!data.hasMore) setActiveQueryId(null);
      } else {
        setHasMore(false);
        setActiveQueryId(null);
      }
    } catch (err) {
      setIsQuerying(false);
      setQueryError(err.message);
    }
  };

  // All Solutions (*)
  const handleAllSolutions = async () => {
    if (!activeQueryId) return;

    setIsQuerying(true);
    try {
      const res = await fetch('/api/query/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId: activeQueryId, maxLimit: 200 })
      });
      const data = await res.json();

      setIsQuerying(false);
      if (data.executionTimeMs) setExecutionTimeMs(data.executionTimeMs);
      if (data.stdout) setStdout(prev => (prev ? prev + '\n' + data.stdout : data.stdout));

      if (data.solutions && data.solutions.length > 0) {
        setSolutions(prev => [...prev, ...data.solutions]);
      }
      setHasMore(false);
      setActiveQueryId(null);
    } catch (err) {
      setIsQuerying(false);
      setQueryError(err.message);
    }
  };

  // Stop Query
  const handleStopQuery = async () => {
    if (activeQueryId) {
      await fetch('/api/query/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId: activeQueryId })
      });
    }
    setActiveQueryId(null);
    setHasMore(false);
  };

  // Reset Engine
  const handleResetEngine = async () => {
    if (!window.confirm('Prolog motorunu sıfırlamak istediğinize emin misiniz? Bellekteki tüm dinamik gerçekler temizlenecektir.')) {
      return;
    }
    try {
      await fetch('/api/reset', { method: 'POST' });
      setSolutions([]);
      setHasMore(false);
      setActiveQueryId(null);
      setStdout('');
      setStderr('');
      handleConsultCode();
    } catch (err) {
      alert('Sıfırlama hatası: ' + err.message);
    }
  };

  const recordHistory = (q, success) => {
    setHistory(prev => [
      { query: q, success, timestamp: Date.now() },
      ...prev.filter(h => h.query !== q).slice(0, 20)
    ]);
  };

  // Load Example Template
  const handleLoadExample = (example) => {
    setCode(example.code);
    setQuery(example.defaultQuery);
    setLeftTab('editor');
    handleConsultCode(example.code, example.filename || 'example.pl');
    setTimeout(() => {
      handleRunQuery(example.defaultQuery);
    }, 400);
  };

  // File Operations
  const handleSelectFile = (filename) => {
    setActiveFilename(filename);
    loadFileContent(filename);
  };

  const handleCreateFile = async (newFilename) => {
    const safeName = newFilename.endsWith('.pl') ? newFilename : newFilename + '.pl';
    const initialContent = `% Dosya: ${safeName}\n\n`;
    await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: safeName, content: initialContent })
    });
    setFiles(prev => [...prev, { name: safeName }]);
    setActiveFilename(safeName);
    setCode(initialContent);
    handleConsultCode(initialContent, safeName);
  };

  const handleDeleteFile = async (filename) => {
    if (files.length <= 1) return;
    if (!window.confirm(`${filename} dosyasını silmek istediğinize emin misiniz?`)) return;

    await fetch(`/api/workspace/${filename}`, { method: 'DELETE' });
    const remaining = files.filter(f => f.name !== filename);
    setFiles(remaining);
    if (activeFilename === filename) {
      handleSelectFile(remaining[0].name);
    }
  };

  const handleExportFile = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFilename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      handleCreateFile(file.name);
      setCode(content);
      handleConsultCode(content, file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Generate quick queries from defined predicates
  const quickQueries = predicates.map(p => p.sampleQuery);

  return (
    <div className="flex flex-col h-screen w-screen bg-prolog-bg text-prolog-text overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        isCompiling={isCompiling}
        compileStatus={compileStatus}
        onConsult={() => handleConsultCode()}
        onReset={handleResetEngine}
        onOpenExamples={() => setIsExamplesOpen(true)}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenTheme={() => setIsThemeOpen(true)}
        onExportFile={handleExportFile}
        onImportFile={handleImportFile}
        activeFilename={activeFilename}
      />

      {/* Main Split Body: Left Editor/Graph, Right Solutions/Terminal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Code Editor OR Knowledge Graph */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-prolog-border">
          {/* Left Panel Tabs Bar */}
          <div className="h-10 bg-prolog-panel border-b border-prolog-border px-3 flex items-center justify-between select-none">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setLeftTab('editor')}
                style={{ 
                  backgroundColor: leftTab === 'editor' ? 'var(--bg-card)' : 'transparent',
                  color: leftTab === 'editor' ? 'var(--accent-color)' : 'var(--text-muted)'
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                  leftTab === 'editor' ? 'border-prolog-border shadow-sm' : 'border-transparent hover:text-prolog-text hover:bg-prolog-hover'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Prolog Editörü</span>
              </button>

              <button
                onClick={() => setLeftTab('graph')}
                style={{ 
                  backgroundColor: leftTab === 'graph' ? 'var(--bg-card)' : 'transparent',
                  color: leftTab === 'graph' ? 'var(--accent-color)' : 'var(--text-muted)'
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                  leftTab === 'graph' ? 'border-prolog-border shadow-sm' : 'border-transparent hover:text-prolog-text hover:bg-prolog-hover'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>İlişkisel Bilgi Grafiği</span>
                {facts.length > 0 && (
                  <span 
                    className="text-[10px] px-1.5 py-0.2 rounded-full font-bold border"
                    style={{ 
                      backgroundColor: 'var(--bg-panel)', 
                      color: 'var(--accent-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {facts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Left Panel Body */}
          <div className="flex-1 flex overflow-hidden">
            {leftTab === 'editor' ? (
              <Editor
                files={files}
                activeFilename={activeFilename}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                code={code}
                onChangeCode={(newCode) => {
                  setCode(newCode);
                  setCompileStatus('dirty');
                }}
                onConsult={() => handleConsultCode()}
                compileError={compileError}
                predicates={predicates}
                onInsertQuery={(sampleQ) => {
                  setQuery(sampleQ);
                  setRightTab('solutions');
                }}
              />
            ) : (
              <KnowledgeGraph facts={facts} />
            )}
          </div>
        </section>

        {/* Right Panel: Solutions Explorer & Query Console (REPL) */}
        <section className="w-full sm:w-[480px] lg:w-[540px] xl:w-[600px] flex flex-col bg-prolog-bg shrink-0">
          {/* Right Panel Tabs Bar */}
          <div className="h-10 bg-prolog-panel border-b border-prolog-border px-3 flex items-center justify-between select-none">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setRightTab('solutions')}
                style={{ 
                  backgroundColor: rightTab === 'solutions' ? 'var(--bg-card)' : 'transparent',
                  color: rightTab === 'solutions' ? 'var(--accent-color)' : 'var(--text-muted)'
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                  rightTab === 'solutions' ? 'border-prolog-border shadow-sm' : 'border-transparent hover:text-prolog-text hover:bg-prolog-hover'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sorgu Çözümleri</span>
                {solutions.length > 0 && (
                  <span 
                    className="text-[10px] px-1.5 py-0.2 rounded-full font-bold border"
                    style={{ 
                      backgroundColor: 'var(--bg-panel)', 
                      color: 'var(--accent-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {solutions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setRightTab('terminal')}
                style={{ 
                  backgroundColor: rightTab === 'terminal' ? 'var(--bg-card)' : 'transparent',
                  color: rightTab === 'terminal' ? 'var(--accent-color)' : 'var(--text-muted)'
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                  rightTab === 'terminal' ? 'border-prolog-border shadow-sm' : 'border-transparent hover:text-prolog-text hover:bg-prolog-hover'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Terminal (G/Ç)</span>
                {(stdout || stderr) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel Body */}
          <div className="flex-1 flex overflow-hidden">
            {rightTab === 'solutions' ? (
              <SolutionsView
                solutions={solutions}
                hasMore={hasMore}
                isQuerying={isQuerying}
                executionTimeMs={executionTimeMs}
                onNext={handleNextSolution}
                onNextBatch={handleNextBatch}
                onAll={handleAllSolutions}
                onStop={handleStopQuery}
                queryFailed={queryFailed}
                error={queryError}
              />
            ) : (
              <TerminalOutput
                stdout={stdout}
                stderr={stderr}
                onClear={() => {
                  setStdout('');
                  setStderr('');
                }}
              />
            )}
          </div>

          {/* Bottom Query Console (REPL) */}
          <QueryConsole
            query={query}
            onChangeQuery={setQuery}
            onRunQuery={() => handleRunQuery()}
            isQuerying={isQuerying}
            hasMore={hasMore}
            onNextSolution={handleNextSolution}
            quickQueries={quickQueries}
            history={history}
            onSelectHistory={(histQ) => {
              setQuery(histQ);
              handleRunQuery(histQ);
            }}
          />
        </section>
      </div>

      {/* Examples Modal */}
      <ExamplesModal
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onLoadExample={handleLoadExample}
      />

      {/* Cheat Sheet Modal */}
      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        onInsertCode={(snippet) => {
          setCode(prev => prev + '\n\n' + snippet);
          setLeftTab('editor');
          setCompileStatus('dirty');
        }}
      />

      {/* Theme & Custom Colors Modal */}
      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={currentTheme}
        onApplyTheme={handleApplyTheme}
        onResetTheme={handleResetTheme}
      />
    </div>
  );
}
