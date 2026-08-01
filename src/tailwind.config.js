/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b9d2ff',
          300: '#8bb4ff',
          400: '#5b8fff',
          500: '#3966f8',
          600: '#2647db',
          700: '#1f38b0',
          800: '#1c318c',
          900: '#1b2d70',
        },
        surface: {
          light: '#f4f8ff',
          card: '#ffffff',
          dark: '#0b1120',
          darkCard: '#121b30',
          darkBorder: '#1f2b45',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(30, 64, 175, 0.12)',
        softDark: '0 4px 24px -6px rgba(0, 0, 0, 0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};