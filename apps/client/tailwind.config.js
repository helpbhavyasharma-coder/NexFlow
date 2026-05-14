/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        surface: '#1e293b',
      },
      boxShadow: {
        glow: '0 0 40px rgba(34, 211, 238, 0.22)',
      },
    },
  },
  plugins: [],
};
