/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./articulos/*.html",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#EDF0F8', 100: '#C5D0EC', 200: '#9BAFD9',
          300: '#7090C6', 400: '#4A6FA5', 500: '#3A5A8E',
          600: '#2D5499', 700: '#1B3566', 800: '#132648', 900: '#0C1830',
        },
        gold: {
          100: '#F5EEC8', 200: '#E8D080', 300: '#D9BC5C',
          400: '#C9A84C', 500: '#B08930', 600: '#8B6A1E',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.12em',
      },
    },
  },
  plugins: [],
};
