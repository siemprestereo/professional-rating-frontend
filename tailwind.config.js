/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'logo-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))', transform: 'scale(1)' },
          '50%': { filter: 'drop-shadow(0 0 35px rgba(255, 255, 255, 1))', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.5s ease-out forwards',
        slideDown: 'slideDown 0.5s ease-out forwards',
        scaleIn: 'scaleIn 0.3s ease-out forwards',
        'logo-pulse': 'logo-pulse 1.5s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}