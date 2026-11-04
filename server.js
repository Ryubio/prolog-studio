const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const prologService = require('./server/prologService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const WORKSPACE_DIR = path.join(__dirname, 'workspace');
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// Populate workspace with initial default file if empty
const defaultMainPath = path.join(WORKSPACE_DIR, 'main.pl');
if (!fs.existsSync(defaultMainPath)) {
  const defaultCode = `% ============================================================
% PrologStudio - Modern Mantık Programlama Çalışma Alanı
% ============================================================

% Gerçekler (Facts)
parent(abraham, isaac).
parent(sarah, isaac).
parent(isaac, jacob).
parent(isaac, esau).
parent(rebekah, jacob).
parent(rebekah, esau).
parent(jacob, joseph).
parent(jacob, benjamin).

male(abraham).
male(isaac).
male(jacob).
male(esau).
male(joseph).
male(benjamin).

female(sarah).
female(rebekah).

% Kurallar (Rules)
father(F, C) :- parent(F, C), male(F).
mother(M, C) :- parent(M, C), female(M).

grandparent(GP, GC) :- parent(GP, P), parent(P, GC).
grandfather(GF, GC) :- grandparent(GF, GC), male(GF).
grandmother(GM, GC) :- grandparent(GM, GC), female(GM).

sibling(X, Y) :-
    parent(P, X),
    parent(P, Y),
    X \\= Y.

% Özyinelemeli Ata Kuralı (Recursive Ancestor)
ancestor(A, D) :- parent(A, D).
ancestor(A, D) :- parent(A, Z), ancestor(Z, D).
`;
  fs.writeFileSync(defaultMainPath, defaultCode, 'utf8');
}

// Initialize SWIPL engine
let engineReady = false;
let initPromise = prologService.init().then(async () => {
  engineReady = true;
  console.log('[PrologStudio] SWI-Prolog WASM motoru hazır.');
  // Consult initial workspace file
  try {
    const code = fs.readFileSync(defaultMainPath, 'utf8');
    await prologService.consult(code, 'main.pl');
  } catch (e) {
    console.error('[PrologStudio] Varsayılan dosya derlenirken hata:', e);
  }
}).catch(err => {
  console.error('[PrologStudio] SWIPL motoru başlatılamadı:', err);
});

// Middleware to ensure engine is initialized
app.use(async (req, res, next) => {
  if (!engineReady) {
    await initPromise;
  }
  next();
});

// --- API Endpoints ---

// Status
app.get('/api/status', (req, res) => {
  res.json({
    ready: engineReady,
    engine: 'SWI-Prolog WebAssembly',
    predicates: prologService.currentPredicates,
    factsCount: prologService.currentFacts.length
  });
});

// Consult Code
app.post('/api/consult', async (req, res) => {
  try {
    const { code, filename = 'workspace.pl' } = req.body;
    if (typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'Kod gönderilmedi.' });
    }

    const result = await prologService.consult(code, filename);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Query
app.post('/api/query', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Sorgu metni girilmedi.' });
    }

    const result = await prologService.startQuery(query, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Next Solution
app.post('/api/query/next', async (req, res) => {
  try {
    const { queryId, count = 1 } = req.body;
    if (!queryId) {
      return res.status(400).json({ success: false, error: 'queryId gereklidir.' });
    }

    const result = await prologService.nextSolutions(queryId, count);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// All Solutions
app.post('/api/query/all', async (req, res) => {
  try {
    const { queryId, maxLimit = 200 } = req.body;
    if (!queryId) {
      return res.status(400).json({ success: false, error: 'queryId gereklidir.' });
    }

    const result = await prologService.allSolutions(queryId, maxLimit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Close Query
app.post('/api/query/close', async (req, res) => {
  prologService.closeActiveQuery();
  res.json({ success: true });
});

// Reset Engine
app.post('/api/reset', async (req, res) => {
  try {
    const result = await prologService.reset();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Workspace Files Management
app.get('/api/workspace', (req, res) => {
  try {
    const files = fs.readdirSync(WORKSPACE_DIR)
      .filter(f => f.endsWith('.pl'))
      .map(name => {
        const fullPath = path.join(WORKSPACE_DIR, name);
        const stats = fs.statSync(fullPath);
        return {
          name,
          size: stats.size,
          updatedAt: stats.mtime
        };
      });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspace/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const fullPath = path.join(WORKSPACE_DIR, filename);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Dosya bulunamadı.' });
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ filename, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspace', (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || typeof content !== 'string') {
      return res.status(400).json({ error: 'Dosya adı ve içerik gereklidir.' });
    }
    const safeName = path.basename(filename.endsWith('.pl') ? filename : filename + '.pl');
    const fullPath = path.join(WORKSPACE_DIR, safeName);
    fs.writeFileSync(fullPath, content, 'utf8');
    res.json({ success: true, filename: safeName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/workspace/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const fullPath = path.join(WORKSPACE_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static frontend if built
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 PrologStudio sunucusu aktif: http://localhost:${PORT}`);
});
