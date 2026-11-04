/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        prolog: {
          bg: 'var(--bg-primary)',
          panel: 'var(--bg-panel)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
          border: 'var(--border-color)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent-color)',
          accentHover: 'var(--accent-hover)',
          variable: 'var(--color-variable)',
          atom: 'var(--color-atom)',
          predicate: 'var(--color-predicate)',
          string: 'var(--color-string)',
          operator: 'var(--color-operator)',
          comment: 'var(--color-comment)'
        }
      }
    },
  },
  plugins: [],
}
