/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e0e0fe',
          200: '#c4c2fd',
          300: '#a49cf9',
          400: '#8876f5',
          500: '#6C63FF',
          600: '#5a50e0',
          700: '#4840b8',
          800: '#383090',
          900: '#1e1a5e',
        },
        violet: { 400: '#a78bfa', 500: '#8B5CF6', 600: '#7c3aed' },
        cyan:   { 400: '#22d3ee', 500: '#00D4FF' },
        surface: {
          50:  '#1e2640',
          100: '#161d33',
          200: '#111827',
          300: '#0d1424',
          400: '#0a1020',
          500: '#070d1a',
          900: '#0F172A',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow:     '0 0 40px rgba(108,99,255,0.3)',
        'glow-sm':'0 0 20px rgba(108,99,255,0.2)',
        glass:    '0 8px 32px rgba(0,0,0,0.4)',
        card:     '0 4px 24px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float':     'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};

