/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        card: '#18181b',
        accent: '#3b82f6', // Electric Blue
        warning: '#f59e0b', // Warning Amber
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};

