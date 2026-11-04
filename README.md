<div align="center">

# 🔮 PrologStudio

**A Modern, High-Performance SWI-Prolog IDE, REPL & Knowledge Graph Visualizer**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![SWI-Prolog](https://img.shields.io/badge/SWI--Prolog-WASM_8.2.6-orange.svg)](https://www.swi-prolog.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

*Tired of outdated, plain, 90s-style Prolog interfaces like SWISH? PrologStudio brings logic programming into the modern era with a sleek glassmorphic UI, real-time query stepper, interactive relational knowledge graphs, and full theme customization.*

[Özellikler (Türkçe)](#-türkçe-özet) • [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [Examples](#-built-in-examples)

---

</div>

## 🚀 Overview

**PrologStudio** is an all-in-one web-based IDE for the Prolog programming language powered by the **official SWI-Prolog WebAssembly (WASM)** engine. It runs pure, standard ISO SWI-Prolog code with zero lag, instant in-memory compilation (<2 ms), interactive solutions stepping, and automatic relational knowledge graph generation.

---

## ✨ Features

### 🧠 Official SWI-Prolog WebAssembly Engine
- Complete, authentic SWI-Prolog running directly in Node/WASM.
- Full support for **Facts, Rules, Recursion, Cuts (`!`), Negation as Failure (`\+`), and DCG Grammars (`-->`)**.
- Built-in modules enabled out of the box:
  - `library(clpfd)` (Constraint Logic Programming over Finite Domains - Sudoku, N-Queens)
  - `library(lists)` (`member/2`, `append/3`, `reverse/2`, `select/3`)
  - `library(apply)` (`maplist/3`, `include/3`, `exclude/3`)

### ⚡ Interactive Query Console & REPL
- Floating terminal prompt with `?- ` command line.
- **Solution Stepping**: Fetch next solution (`;`), batch 10 solutions, or retrieve all solutions (`*`).
- **Cards View & Table View**: Toggle between color-coded variable badges and tabular matrix comparison.
- Execution stopwatch measuring query performance down to tenths of a millisecond.
- Query history navigation with `Up` / `Down` arrow keys.

### 🕸️ Interactive Relational Knowledge Graph Visualizer
- Automatically parses binary ground facts (e.g. `parent(abraham, isaac)`, `edge(istanbul, ankara)`) into a dynamic, physics-based network diagram.
- **SVG Vector Rendering**: Crisp at any resolution, zero black-screen issues, smooth drag-and-drop nodes.
- Filter by relationship predicate (`parent/2`, `edge/2`), search entities, and click any node to inspect all incoming/outgoing connections.

### 🎨 Live Theme Engine & Custom Color Picker
- **8 Curated Themes**:
  - *Obsidian Indigo* (Default sleek dark)
  - *Cyberpunk Neon* (High-contrast cyan & pink)
  - *Emerald Matrix* (Deep pine & mint green)
  - *Dracula Purple* (Vampire lilac & soft cyan)
  - *Nordic Frost* (Arctic polar slate & ice blue)
  - *Amber Sunset* (Warm obsidian & golden amber)
  - *Clean Light* (Modern crisp light mode)
- **Manual Color Customizer**: Use the built-in color wheel or HEX inputs to manually choose your own Accent, Variable, Atom, Predicate, Background, Panel, and Border colors with live preview.
- Settings are saved automatically in `localStorage`.

### 📝 Smart Prolog Code Editor
- Real-time Prolog syntax highlighting (Variables in gold, Atoms in sky blue, Directives in purple, Built-ins in pink).
- Line numbers, smart auto-indentation on Enter, tab key (2 spaces), and bracket matching.
- **Predicate Outline**: Side drawer extracting all defined `name/arity` predicates. Click to jump to line, or click `?-` to insert the query template directly into the console.
- Inline compiler error alerts pinpointing syntax errors.

### 📂 Multi-file Workspace & Export
- Create, rename, edit, and delete multiple `.pl` files in the workspace.
- One-click export / download `.pl` files to your computer, or import existing files.

---

## 📊 Comparison with SWISH

| Feature | PrologStudio | SWISH |
|---|:---:|:---:|
| **UI Design** | Modern Obsidian / Glassmorphic / Custom | 90s Web Style / Sterile |
| **Interactive Knowledge Graph** | ✅ Built-in Vector Force Graph | ❌ Text / Static Graphviz |
| **Theme Customizer** | ✅ 8 Presets + Custom Color Pickers | ❌ Fixed Default |
| **Predicate Outline & Navigator** | ✅ Dedicated drawer with line jump | ❌ None |
| **Solutions Presentation** | ✅ Cards View + Table View + Badges | ⚠️ Raw Prolog Text |
| **Execution Engine** | ⚡ Official SWI-Prolog WASM | ⚡ SWI-Prolog Daemon |
| **One-Click Query Templates** | ✅ Click `?-` on any predicate | ❌ Manual typing |
| **Built-in Cheat Sheet** | ✅ Searchable interactive guide | ❌ External docs |

---

## 🏃 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Clone & Install

```bash
git clone https://github.com/Ryubio/prolog-studio.git
cd prolog-studio
npm install
```

### 2. Build & Launch

```bash
# Build the frontend and start the server
npm run build
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Development Mode

To run with Vite hot-module replacement:
```bash
# Terminal 1: Start backend API
npm run server

# Terminal 2: Start Vite dev server
npm run dev
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + S` / `Cmd + S` | **Consult Code** (Compile active file into Prolog memory) |
| `Enter` / `Ctrl + Enter` | **Execute Query** in console |
| `;` (Semicolon) | **Next Solution** (Step to next Prolog binding) |
| `Up` / `Down` Arrow | Navigate **Query History** |
| `Tab` | Insert 2 spaces indentation in editor |
| `Escape` | Close modals / Clear selection |

---

## 📦 Built-in Examples

PrologStudio includes 8 curated, production-ready Prolog programs that you can load with one click from the **"Örnekler"** menu:

1. **Family Tree & Kinship (`aile_agaci.pl`)**: Classic genealogy rules, recursive ancestor relations, and gender predicates.
2. **Graph Search & Shortest Path (`graf_arama.pl`)**: Weighted Turkish inter-city graph with cycle-free pathfinding and `setof/3` optimization.
3. **8-Queens Puzzle (`vezir_8.pl`)**: Constraint Logic Programming over Finite Domains (`clpfd`) solving the classic chess puzzle instantly.
4. **Monkey & Banana Planning (`maymun_muz.pl`)**: Classic AI state-space planning generating action sequences (`move`, `push`, `climb`, `grasp`).
5. **Turkish DCG Grammar (`turkce_dcg.pl`)**: Definite Clause Grammar parser parsing Turkish sentences and generating semantic parse trees.
6. **9x9 Sudoku Solver (`sudoku.pl`)**: Constraint solver using `all_distinct/1` across rows, columns, and 3x3 blocks.
7. **Einstein's Zebra Puzzle (`zebra_bilmecesi.pl`)**: 5 houses deduction puzzle determining who drinks water and owns the zebra.
8. **Animal Diagnosis Expert System (`uzman_sistem.pl`)**: Backward-chaining rule-based diagnostic engine.

---

## 🏗️ Architecture

```
prolog-studio/
├── server.js               # Express 5 REST API & Static File Server
├── server/
│   └── prologService.js    # SWI-Prolog WASM manager, query sessions, AST parser
├── workspace/              # Local storage for user .pl files
├── src/
│   ├── App.jsx             # Root layout & multi-pane state manager
│   ├── components/
│   │   ├── Navbar.jsx          # Header, compile status, action buttons
│   │   ├── Editor.jsx          # Code editor with outline and syntax highlighting
│   │   ├── QueryConsole.jsx    # REPL input, shortcuts, history dropdown
│   │   ├── SolutionsView.jsx   # Cards & Table variable bindings viewer
│   │   ├── KnowledgeGraph.jsx  # Interactive SVG relational graph visualizer
│   │   ├── TerminalOutput.jsx  # Standard I/O stdout/stderr stream console
│   │   ├── ThemeModal.jsx      # Theme gallery & manual color customizer
│   │   ├── ExamplesModal.jsx   # Curated example templates browser
│   │   └── CheatSheetModal.jsx # Searchable Prolog syntax & predicates guide
│   ├── data/
│   │   ├── examples.js     # 8 pre-built Prolog demonstration files
│   │   ├── cheatSheet.js   # Prolog reference guide data
│   │   └── themes.js       # Preset color palette configurations
│   └── utils/
│       └── prologHighlighter.js # Prolog tokenizer and HTML syntax styler
├── vite.config.js          # Vite build configuration
├── tailwind.config.js      # Dynamic CSS variables theme configuration
└── package.json
```

---

## 🇹🇷 Türkçe Özet

**PrologStudio**, SWISH'in hantal ve eski arayüzüne alternatif olarak tasarlanmış, **resmi SWI-Prolog WebAssembly** çekirdeği üzerinde koşan modern bir mantık programlama IDE'sidir.

* **Gerçek SWI-Prolog:** `library(clpfd)`, `library(lists)`, `library(apply)` ve DCG gramerleri dahil tam uyumluluk.
* **Görselleştirici:** 2 argümanlı ilişkileri (`parent(X,Y)`, `edge(A,B)`) otomatik olarak interaktif SVG ağ grafiğine dönüştürür.
* **Tema Motoru:** 8 hazır tema veya renk tekerleğinden kendi renklerinizi elle seçebilme.
* **İnteraktif REPL:** `;` ile adım adım çözüm alma, kart ve tablo görünümleri, çalışma süresi ölçümü.
* **8 Hazır Proje & Kılavuz:** Aile ağacı, graf arama, N-vezir, maymun-muz yapay zeka planlama, Türkçe gramer ayrıştırıcı ve Sudoku çözücü.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
Crafted with ❤️ by <a href="https://github.com/Ryubio">Ryubio</a>
</div>
