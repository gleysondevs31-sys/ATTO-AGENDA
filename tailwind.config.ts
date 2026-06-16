import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        atto: {
          red: '#ed1c24',
          green: '#129247',
          ink: '#09090b',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15,23,42,.10)',
      },
    },
  },
  plugins: [],
};

export default config;
