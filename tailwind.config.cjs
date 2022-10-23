/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        bleachWhite: '#FFF2DC',
        midnightBlue: '#272556',
        dustyOrange: '#F5843E',
        seaPink: '#F99292',
        chardonnay: '#FFC679',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
}
