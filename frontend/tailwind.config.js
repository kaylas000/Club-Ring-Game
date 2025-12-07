/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#32b8c6',
        secondary: '#5e5240',
        dark: '#1f2127',
      },
    },
  },
  plugins: [],
};
