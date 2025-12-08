/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          dark: '#E85A2B',
          light: '#FF8558',
        },
        secondary: {
          DEFAULT: '#004E89',
          dark: '#003D6B',
          light: '#1A6BA8',
        },
        accent: {
          DEFAULT: '#FFD23F',
          dark: '#E6BC2F',
          light: '#FFE066',
        },
        ring: {
          canvas: '#2C2C2C',
          rope: '#C41E3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Archivo Black', 'sans-serif'],
      },
      animation: {
        'punch': 'punch 0.3s ease-out',
        'dodge': 'dodge 0.2s ease-in-out',
        'ko': 'ko 1s ease-out forwards',
      },
      keyframes: {
        punch: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
        },
        dodge: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-15px)' },
        },
        ko: {
          '0%': { transform: 'rotate(0deg) translateY(0)' },
          '100%': { transform: 'rotate(-90deg) translateY(50px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
