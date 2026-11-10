import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vantiq: {
          navy: '#101827',
          black: '#101114',
          charcoal: '#202124',
          ivory: '#F6F2EA',
          violet: '#8C7BB8',
          sage: '#A5B59A',
          olive: '#737653',
          rosewood: '#936D72',
          terracotta: '#B86C50',
          gold: '#C6AD83',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
  darkMode: ['class'],
};

export default config;
