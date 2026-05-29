import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'off-white': '#F9F8F6',
        brand: {
          blue: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
          },
        },
        // Aliases semânticos para uso direto em className
        'accent': 'var(--accent-primary)',
        'accent-hover': 'var(--accent-primary-hover)',
        'highlight': 'var(--highlight-word-bg)',
        'highlight-text': 'var(--highlight-word-text)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Escala padrão mantida + aliases da marca
        'reading': ['1.125rem', { lineHeight: '1.75' }],  // 18px — área de leitura
        'ui': ['0.875rem', { lineHeight: '1.5' }],        // 14px — controles
      },
      lineHeight: {
        'reading': '1.75',
        'tight': '1.3',
      },
      borderRadius: {
        'brand-sm': '4px',
        'brand-md': '6px',
        'brand-lg': '8px',    // máximo em containers (regra ARIA)
      },
      boxShadow: {
        'brand-sm': '0 1px 2px rgba(15, 23, 42, 0.06)',
        'brand-md': '0 2px 8px rgba(15, 23, 42, 0.08)',
      },
      transitionDuration: {
        'fast': '100ms',
        'base': '150ms',
        'slow': '250ms',
      },
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      maxWidth: {
        'reader': '72ch',   // largura ideal para leitura confortável
        'player': '640px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      keyframes: {
        'word-pulse': {
          '0%, 100%': { backgroundColor: 'var(--highlight-word-bg)' },
          '50%': { backgroundColor: '#BFDBFE' },   // blue-200
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'word-pulse': 'word-pulse 0.6s ease-in-out',
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
      },
    },
  },
  plugins: [],
}

export default config
