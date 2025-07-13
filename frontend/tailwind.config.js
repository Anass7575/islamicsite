/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Islamic manuscript inspired colors
        emerald: {
          deep: '#0F766E',
          light: '#10B981',
          dark: '#064E3B',
        },
        gold: {
          soft: '#F59E0B',
          bright: '#FCD34D',
          muted: '#D97706',
        },
        cream: {
          DEFAULT: '#FEF3C7',
          light: '#FFFBEB',
          dark: '#F9E8B8',
        },
        sage: {
          DEFAULT: '#4B5945',
          light: '#6B7763',
          dark: '#2D3530',
        },
        // Keep existing colors for backward compatibility
        islamic: {
          50: '#e6f7f0',
          100: '#b3e5d1',
          200: '#80d4b2',
          300: '#4dc293',
          400: '#26b67d',
          500: '#00a968',
          600: '#009c5f',
          700: '#008a54',
          800: '#007848',
          900: '#005833',
        },
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        'arabic': ['Amiri', 'Traditional Arabic', 'Noto Naskh Arabic', 'serif'],
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'rotate': 'rotate 60s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'ink-flow': 'inkFlow 3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'page-turn': 'pageTurn 1s ease-in-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' },
        },
        shimmer: {
          to: { backgroundPosition: '-200% 0' },
        },
        blob: {
          '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
          '50%': { borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%' },
        },
        rotate: {
          to: { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        inkFlow: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '50%': { opacity: 0.7 },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pageTurn: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-180deg)' },
        },
      },
      borderRadius: {
        'organic-sm': '0.75rem 0.875rem 0.75rem 0.875rem',
        'organic': '0.875rem 0.75rem 0.875rem 0.75rem',
        'organic-lg': '1.25rem 1.5rem 1.25rem 1.5rem',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'large': '0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'gold': '0 4px 14px rgba(245, 158, 11, 0.15)',
        'emerald': '0 4px 14px rgba(15, 118, 110, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'islamic-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230F766E' fill-opacity='0.03'%3E%3Cpath d='M30 30l-10-17.32L30 0l10 12.68L30 30zm0 0l10 17.32L30 60l-10-12.68L30 30zm0 0l17.32-10L60 30l-12.68 10L30 30zm0 0l-17.32 10L0 30l12.68-10L30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}