/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        porscheRed: '#FF2800',
        porscheBlue: '#2244FF'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
