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
        canvas: {
          light: '#F8F9FA',
          dark: '#000000',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0A0A0C',
          subtleLight: '#F1F3F5',
          subtleDark: '#141418',
        },
        borderUi: {
          light: '#E2E8F0',
          dark: '#27272A',
          strongLight: '#0F172A',
          strongDark: '#52525B',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          900: '#0F172A',
          accent: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neo': '2px 2px 0px #0F172A',
        'neo-sm': '1px 1px 0px #0F172A',
        'neo-lg': '4px 4px 0px #0F172A',
        'neo-dark': '2px 2px 0px #52525B',
      }
    },
  },
  plugins: [],
}
