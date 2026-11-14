/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vantiq-navy': '#101827',
        'vantiq-charcoal': '#1A1D24',
        'vantiq-black': '#0F1117',
        'vantiq-purple': '#8C7BB8',
        'vantiq-gold': '#C6AD83',
        'vantiq-olive': '#A5B59A',
        'vantiq-ivory': '#F6F2EA',
      },
    },
  },
  plugins: [],
}
