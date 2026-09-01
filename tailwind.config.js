/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mpl: {
          dark: '#070b14',
          navy: '#0f172a',
          card: '#131d36',
          border: '#1e293b',
          gold: '#f59e0b',
          goldLight: '#fbbf24',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          green: '#22c55e',
          red: '#ef4444',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        display: ['Teko', 'Rajdhani', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(245, 158, 11, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
