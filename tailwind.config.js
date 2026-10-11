/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e1f0e6',
          200: '#c3e1ce',
          300: '#97caaa',
          400: '#64ac80',
          500: '#3f905f',
          600: '#2e744b',
          700: '#265d3d',
          800: '#214a33',
          900: '#1c3e2b',
          950: '#0d2217',
        },
        sage: {
          50: '#f5f7f4',
          100: '#e7ede5',
          200: '#d1dccf',
          300: '#afc4ab',
          400: '#8ba687',
          500: '#6d8a69',
          600: '#546f51',
          700: '#435741',
          800: '#384737',
          900: '#303b2f',
        },
        cream: {
          50: '#fdfcf9',
          100: '#faf7f0',
          200: '#f3ece0',
          300: '#ebdcc7',
          400: '#e0c7a7',
          500: '#d4b087',
          600: '#c59a6d',
          700: '#a57c55',
          800: '#866448',
          900: '#6d523c',
        },
        earth: {
          50: '#faf6f3',
          100: '#f3eae2',
          200: '#e6d3c3',
          300: '#d5b69f',
          400: '#c1967a',
          500: '#b17c5d',
          600: '#a3694f',
          700: '#885341',
          800: '#6f4538',
          900: '#5c3b31',
        },
        flora: {
          gold: '#f59e0b',
          xp: '#8b5cf6',
          sun: '#fbbf24',
          water: '#38bdf8',
          leaf: '#22c55e',
          bloom: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 64, 45, 0.12)',
        'glass-glow': '0 0 25px rgba(52, 211, 153, 0.25)',
        'card-hover': '0 20px 30px -10px rgba(24, 60, 40, 0.15)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        sprout: {
          '0%': { transform: 'scale(0.8) translateY(10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        sprout: 'sprout 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
