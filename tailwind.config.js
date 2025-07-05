/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-charcoal': '#1A1A1A',
        'light-gray': '#2C2C2C',
        'soft-white': '#F5F5F5',
        'electric-blue': '#007BFF',
        'cyan-glow': '#00FFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
