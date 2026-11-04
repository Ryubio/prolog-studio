// Tokenizer and syntax highlighter for Prolog code

const BUILT_INS = new Set([
  'consult', 'use_module', 'library', 'write', 'writeln', 'nl', 'format', 'read',
  'asserta', 'assertz', 'retract', 'retractall', 'member', 'append', 'length',
  'reverse', 'select', 'permutation', 'sort', 'between', 'findall', 'setof',
  'bagof', 'fail', 'true', 'false', 'halt', 'once', 'call', 'maplist',
  'all_distinct', 'ins', 'label', 'labeling', 'transpose', 'dif', 'is', 'mod',
  'div', 'atom', 'integer', 'float', 'number', 'var', 'nonvar', 'compound'
]);

export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function highlightProlog(code) {
  if (!code) return '';

  const lines = code.split('\n');
  const highlightedLines = lines.map(line => {
    let result = '';
    let i = 0;
    const len = line.length;

    while (i < len) {
      // Check for line comment %
      if (line[i] === '%') {
        const comment = escapeHtml(line.substring(i));
        result += `<span class="pl-comment">${comment}</span>`;
        break;
      }

      // Check for string "..."
      if (line[i] === '"') {
        let end = i + 1;
        while (end < len && line[end] !== '"') {
          if (line[end] === '\\') end++; // skip escaped
          end++;
        }
        if (end < len) end++; // include closing quote
        const str = escapeHtml(line.substring(i, end));
        result += `<span class="pl-string">${str}</span>`;
        i = end;
        continue;
      }

      // Check for quoted atom '...'
      if (line[i] === "'") {
        let end = i + 1;
        while (end < len && line[end] !== "'") {
          if (line[end] === '\\') end++;
          end++;
        }
        if (end < len) end++;
        const atom = escapeHtml(line.substring(i, end));
        result += `<span class="pl-atom">${atom}</span>`;
        i = end;
        continue;
      }

      // Check for multi-char operators
      if (line.startsWith(':-', i) || line.startsWith('-->', i)) {
        const op = line.startsWith('-->', i) ? '-->' : ':-';
        result += `<span class="pl-directive font-bold">${op}</span>`;
        i += op.length;
        continue;
      }

      if (line.startsWith('#\\=', i) || line.startsWith('#=', i) || 
          line.startsWith('=:=', i) || line.startsWith('=\\=', i) || 
          line.startsWith('\\=', i) || line.startsWith('->', i) || 
          line.startsWith('\\+', i) || line.startsWith('>=', i) || 
          line.startsWith('=<', i)) {
        const match = line.substring(i).match(/^(#\\=|#=|=:=|=\\=|\\=|->|\\\+|>=|=<)/)[0];
        result += `<span class="pl-operator font-semibold">${escapeHtml(match)}</span>`;
        i += match.length;
        continue;
      }

      // Single char operators
      if ('=!,;+-*/<>|'.includes(line[i])) {
        result += `<span class="pl-operator">${line[i]}</span>`;
        i++;
        continue;
      }

      // Numbers
      if (/\d/.test(line[i]) && (i === 0 || !/[a-zA-Z0-9_]/.test(line[i - 1]))) {
        const numMatch = line.substring(i).match(/^\d+(\.\d+)?/);
        if (numMatch) {
          result += `<span class="pl-number">${numMatch[0]}</span>`;
          i += numMatch[0].length;
          continue;
        }
      }

      // Identifiers (Variables vs Atoms vs Built-ins)
      if (/[a-zA-Z_]/.test(line[i])) {
        const idMatch = line.substring(i).match(/^[a-zA-Z0-9_]+/);
        if (idMatch) {
          const id = idMatch[0];
          // Variable: starts with uppercase or underscore
          if (/^[A-Z_]/.test(id)) {
            result += `<span class="pl-variable">${escapeHtml(id)}</span>`;
          } else if (BUILT_INS.has(id)) {
            result += `<span class="pl-builtin">${escapeHtml(id)}</span>`;
          } else {
            result += `<span class="pl-atom">${escapeHtml(id)}</span>`;
          }
          i += id.length;
          continue;
        }
      }

      // Default char
      result += escapeHtml(line[i]);
      i++;
    }

    return result;
  });

  return highlightedLines.join('\n');
}
