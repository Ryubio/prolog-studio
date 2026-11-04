const SWIPL = require('swipl-wasm');
const crypto = require('crypto');

class PrologService {
  constructor() {
    this.swipl = null;
    this.stdoutBuffer = [];
    this.stderrBuffer = [];
    this.activeQuery = null;
    this.activeQueryId = null;
    this.consultedCode = '';
    this.currentPredicates = [];
    this.currentFacts = [];
  }

  async init() {
    this.stdoutBuffer = [];
    this.stderrBuffer = [];

    this.swipl = await SWIPL({
      arguments: ['-q'],
      print: (text) => {
        this.stdoutBuffer.push({ type: 'stdout', text, time: Date.now() });
      },
      printErr: (text) => {
        this.stderrBuffer.push({ type: 'stderr', text, time: Date.now() });
      }
    });

    // Auto-load common modules for maximum developer convenience
    try {
      this.swipl.prolog.query("use_module(library(lists)).").once();
      this.swipl.prolog.query("use_module(library(apply)).").once();
      this.swipl.prolog.query("use_module(library(clpfd)).").once();
    } catch (e) {
      console.warn("Notice: optional modules load:", e.message);
    }

    return true;
  }

  async reset() {
    this.closeActiveQuery();
    await this.init();
    if (this.consultedCode) {
      await this.consult(this.consultedCode, 'workspace.pl');
    }
    return { success: true, message: 'Prolog motoru sıfırlandı ve yeniden başlatıldı.' };
  }

  closeActiveQuery() {
    if (this.activeQuery) {
      try {
        this.activeQuery.close();
      } catch (e) {
        // ignore
      }
      this.activeQuery = null;
      this.activeQueryId = null;
    }
  }

  parseClauses(code) {
    const lines = code.split('\n');
    const predicatesMap = new Map();
    const facts = [];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.replace(/%.*$/, '').trim();
      if (!line) continue;

      // Match predicate head
      const headMatch = line.match(/^([a-z][a-zA-Z0-9_]*)(?:\s*\((.*?)\))?\s*(:-|-->|\.)/);
      if (headMatch) {
        const name = headMatch[1];
        const argsStr = headMatch[2];
        const sep = headMatch[3];
        const isFact = (sep === '.');
        
        let args = [];
        if (argsStr && argsStr.trim()) {
          args = argsStr.split(',').map(s => s.trim());
        }
        const arity = args.length;
        const key = `${name}/${arity}`;

        if (!predicatesMap.has(key)) {
          predicatesMap.set(key, {
            key,
            name,
            arity,
            line: i + 1,
            clausesCount: 1,
            sampleQuery: `${name}(${Array.from({length: arity}, (_, idx) => String.fromCharCode(65 + idx)).join(', ')}).`
          });
        } else {
          predicatesMap.get(key).clausesCount++;
        }

        // Ground binary facts for Knowledge Graph
        if (isFact && arity === 2) {
          const from = args[0];
          const to = args[1];
          if (/^[a-z0-9_]+$/.test(from) && /^[a-z0-9_]+$/.test(to)) {
            facts.push({ relation: name, from, to });
          }
        }
      }
    }

    return {
      predicates: Array.from(predicatesMap.values()),
      facts
    };
  }

  formatValue(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'string') {
      if (/^[a-z][a-zA-Z0-9_]*$/.test(v)) return v;
      return "'" + v.replace(/'/g, "\\'") + "'";
    }
    if (Array.isArray(v)) {
      return '[' + v.map(item => this.formatValue(item)).join(', ') + ']';
    }
    if (typeof v === 'object') {
      if (v.constructor && v.constructor.name === 'class_string') {
        return '"' + (v.v || '').replace(/"/g, '\\"') + '"';
      }
      if (v.constructor && v.constructor.name === 'class_var') {
        return '_' + (v.v || 'Var');
      }
      if (v.functor) {
        const raw = v[v.functor];
        const args = (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) 
          ? raw[0] 
          : (Array.isArray(raw) ? raw : []);
        return v.functor + '(' + args.map(item => this.formatValue(item)).join(', ') + ')';
      }
    }
    return String(v);
  }

  formatBindings(rawBindings) {
    if (!rawBindings) return null;
    if (rawBindings.success === false) return null;

    const formatted = {};
    const keys = Object.keys(rawBindings).filter(k => k !== '$tag' && k !== 'success');
    
    // If no variables were bound but query succeeded:
    if (keys.length === 0) {
      return { _truth: true };
    }

    for (const key of keys) {
      formatted[key] = this.formatValue(rawBindings[key]);
    }
    return formatted;
  }

  async consult(code, filename = 'workspace.pl') {
    this.closeActiveQuery();
    this.stdoutBuffer = [];
    this.stderrBuffer = [];
    this.consultedCode = code;

    const parsed = this.parseClauses(code);
    this.currentPredicates = parsed.predicates;
    this.currentFacts = parsed.facts;

    const filePath = `/${filename}`;
    try {
      this.swipl.FS.writeFile(filePath, code);
      const startTime = performance.now();
      
      const consultQuery = `consult('${filePath}').`;
      const res = this.swipl.prolog.query(consultQuery).once();
      const elapsed = Math.round((performance.now() - startTime) * 100) / 100;

      const errors = this.stderrBuffer.map(e => e.text).join('\n');
      const stdout = this.stdoutBuffer.map(o => o.text).join('\n');

      if (res && res.error) {
        return {
          success: false,
          error: res.message || errors || 'Bilinmeyen derleme hatası',
          stdout,
          stderr: errors,
          elapsedMs: elapsed,
          predicates: parsed.predicates,
          facts: parsed.facts
        };
      }

      const hasError = errors.toLowerCase().includes('error:');

      return {
        success: !hasError,
        error: hasError ? errors : null,
        stdout,
        stderr: errors,
        elapsedMs: elapsed,
        predicates: parsed.predicates,
        facts: parsed.facts
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        predicates: parsed.predicates,
        facts: parsed.facts
      };
    }
  }

  cleanQueryString(q) {
    let trimmed = q.trim();
    if (trimmed.startsWith('?-')) {
      trimmed = trimmed.substring(2).trim();
    }
    if (!trimmed.endsWith('.')) {
      trimmed += '.';
    }
    return trimmed;
  }

  async startQuery(queryString, limit = 5) {
    this.closeActiveQuery();
    this.stdoutBuffer = [];
    this.stderrBuffer = [];

    const clean = this.cleanQueryString(queryString);
    const startTime = performance.now();

    try {
      const q = this.swipl.prolog.query(clean);
      const queryId = crypto.randomUUID();
      this.activeQuery = q;
      this.activeQueryId = queryId;

      const solutions = [];
      let hasMore = true;

      for (let i = 0; i < limit; i++) {
        const step = q.next();
        if (!step || step.done) {
          hasMore = false;
          break;
        }

        if (step.value && step.value.error) {
          this.closeActiveQuery();
          const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
          return {
            queryId,
            success: false,
            error: step.value.message || 'Sorgu hatası',
            solutions: [],
            hasMore: false,
            executionTimeMs: elapsed,
            stdout: this.stdoutBuffer.map(o => o.text).join('\n'),
            stderr: this.stderrBuffer.map(e => e.text).join('\n')
          };
        }

        const formatted = this.formatBindings(step.value);
        if (formatted) {
          solutions.push(formatted);
        } else {
          // Failure with no bindings
          hasMore = false;
          break;
        }
      }

      if (!hasMore) {
        this.closeActiveQuery();
      }

      const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        queryId: hasMore ? queryId : null,
        success: solutions.length > 0 || clean.includes('write'),
        solutions,
        hasMore,
        executionTimeMs: elapsed,
        stdout: this.stdoutBuffer.map(o => o.text).join('\n'),
        stderr: this.stderrBuffer.map(e => e.text).join('\n')
      };
    } catch (err) {
      this.closeActiveQuery();
      const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        queryId: null,
        success: false,
        error: err.message,
        solutions: [],
        hasMore: false,
        executionTimeMs: elapsed,
        stdout: this.stdoutBuffer.map(o => o.text).join('\n'),
        stderr: this.stderrBuffer.map(e => e.text).join('\n')
      };
    }
  }

  async nextSolutions(queryId, count = 1) {
    if (!this.activeQuery || this.activeQueryId !== queryId) {
      return {
        queryId: null,
        solutions: [],
        hasMore: false,
        error: 'Aktif sorgu bulunamadı veya sorgu zaten tamamlandı.'
      };
    }

    const startTime = performance.now();
    const solutions = [];
    let hasMore = true;

    try {
      for (let i = 0; i < count; i++) {
        const step = this.activeQuery.next();
        if (!step || step.done) {
          hasMore = false;
          break;
        }

        if (step.value && step.value.error) {
          this.closeActiveQuery();
          return {
            queryId: null,
            error: step.value.message,
            solutions: [],
            hasMore: false
          };
        }

        const formatted = this.formatBindings(step.value);
        if (formatted) {
          solutions.push(formatted);
        } else {
          hasMore = false;
          break;
        }
      }

      if (!hasMore) {
        this.closeActiveQuery();
      }

      const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        queryId: hasMore ? queryId : null,
        solutions,
        hasMore,
        executionTimeMs: elapsed,
        stdout: this.stdoutBuffer.map(o => o.text).join('\n'),
        stderr: this.stderrBuffer.map(e => e.text).join('\n')
      };
    } catch (err) {
      this.closeActiveQuery();
      return {
        queryId: null,
        error: err.message,
        solutions: [],
        hasMore: false
      };
    }
  }

  async allSolutions(queryId, maxLimit = 200) {
    if (!this.activeQuery || this.activeQueryId !== queryId) {
      return {
        queryId: null,
        solutions: [],
        hasMore: false,
        error: 'Aktif sorgu bulunamadı.'
      };
    }

    const startTime = performance.now();
    const solutions = [];

    try {
      while (solutions.length < maxLimit) {
        const step = this.activeQuery.next();
        if (!step || step.done) {
          break;
        }

        if (step.value && step.value.error) {
          break;
        }

        const formatted = this.formatBindings(step.value);
        if (formatted) {
          solutions.push(formatted);
        } else {
          break;
        }
      }

      this.closeActiveQuery();
      const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        queryId: null,
        solutions,
        hasMore: false,
        totalFetched: solutions.length,
        executionTimeMs: elapsed,
        stdout: this.stdoutBuffer.map(o => o.text).join('\n'),
        stderr: this.stderrBuffer.map(e => e.text).join('\n')
      };
    } catch (err) {
      this.closeActiveQuery();
      return {
        queryId: null,
        error: err.message,
        solutions: [],
        hasMore: false
      };
    }
  }
}

module.exports = new PrologService();
