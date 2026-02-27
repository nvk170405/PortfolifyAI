/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#000000',
          800: '#111111',
          700: '#1A1A1A',
          600: '#2E2E2E',
        },
        light: {
          100: '#FFFFFF',
          200: '#F9FAFB',
          300: '#E6E6E6',
          400: '#D1D5DB'
        },
        brand: {
          primary: '#000000',
          accent: '#2E2E2E',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'nav': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 40px -10px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
