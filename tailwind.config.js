/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
      },
      colors: {
        primary: {
          50: 'rgba(var(--color-primary-rgb, 14, 165, 233), 0.05)',
          100: 'rgba(var(--color-primary-rgb, 14, 165, 233), 0.1)',
          200: 'rgba(var(--color-primary-rgb, 14, 165, 233), 0.2)',
          300: 'rgba(var(--color-primary-rgb, 14, 165, 233), 0.3)',
          400: 'rgba(var(--color-primary-rgb, 14, 165, 233), 0.5)',
          500: 'rgb(var(--color-primary-rgb, 14, 165, 233))',
          600: 'rgb(var(--color-primary-rgb, 14, 165, 233))',
          700: 'rgba(var(--color-primary-rgb, 14, 165, 233), 0.85)',
          800: 'rgba(var(--color-primary-rgb, 14, 165, 233), 0.9)',
          900: 'rgba(var(--color-primary-rgb, 14, 165, 233), 0.95)',
          950: 'rgba(var(--color-primary-rgb, 14, 165, 233), 1)',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.22)',
        'glow': '0 0 30px rgba(14, 165, 233, 0.2)',
      },
    },
  },
  plugins: [],
};
