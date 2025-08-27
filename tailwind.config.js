/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '90rem',
      },
      colors: {
        'gray-0': '#FAFAFA',
        'gray-50': '#F9F9F9',
        'gray-100': '#F1F3F5',
        'gray-200': '#E6E8EB',
        'gray-300': '#D5D7DA',
        'gray-400': '#A1A3A7',
        'gray-500': '#737577',
        'gray-600': '#4A4D52',
        'gray-700': '#343538',
        'gray-800': '#1C1C1F',
        'gray-900': '#0C0C0D',
      },
      fontSize: {
        'xsmall': '10px',
      },
      screens: {
        xs: '475px',
        small: '640px',  // 定義 small breakpoint
      },
    },
  },
  plugins: [],
}
