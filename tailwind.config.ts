import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7f8',
          100: '#eceef0',
          200: '#d6dadf',
          300: '#b1b9c1',
          400: '#838e98',
          500: '#5f6a76',
          600: '#475260',
          700: '#37404b',
          800: '#252b33',
          900: '#16191e',
          950: '#0b0d10',
        },
        accent: {
          DEFAULT: '#7c5cff',
          50: '#f1edff',
          100: '#e2daff',
          200: '#c6b6ff',
          300: '#a18aff',
          400: '#7c5cff',
          500: '#5a3bff',
          600: '#3f25e0',
          700: '#321bb1',
          800: '#291a8a',
          900: '#21176b',
        },
        cyan: {
          DEFAULT: '#22d3ee',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        bn: ['var(--font-bn)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'display-sm': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        'display-md': ['3rem', { lineHeight: '3.25rem', letterSpacing: '-0.03em' }],
        'display-lg': ['3.75rem', { lineHeight: '4rem', letterSpacing: '-0.035em' }],
        'display-xl': ['4.5rem', { lineHeight: '5rem', letterSpacing: '-0.04em' }],
        'display-2xl': ['5.5rem', { lineHeight: '5.75rem', letterSpacing: '-0.04em' }],
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(15, 17, 21, 0.04), 0 8px 24px rgba(15, 17, 21, 0.06)',
        'soft-lg': '0 1px 2px rgba(15, 17, 21, 0.04), 0 24px 60px rgba(15, 17, 21, 0.08)',
        'ring-accent': '0 0 0 1px rgba(124, 92, 255, 0.18), 0 8px 32px rgba(124, 92, 255, 0.18)',
        'inner-border': 'inset 0 0 0 1px rgba(15, 17, 21, 0.06)',
      },
      borderRadius: {
        'xs': '4px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'orbit': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(40px, -30px) scale(1.06)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease forwards',
        'fade-in': 'fade-in 0.7s ease forwards',
        'shimmer': 'shimmer 1.6s linear infinite',
        'orbit': 'orbit 9s ease-in-out infinite',
        'marquee': 'marquee 32s linear infinite',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(15,17,21,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,17,21,0.05) 1px, transparent 1px)",
        'dot-pattern': "radial-gradient(rgba(15,17,21,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;