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
      fontFamily: {
        sans: ['var(--font-base)'],
        heading: ['var(--font-heading)'],
        body: ['var(--font-base)'],
      },
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
        "xs": ["0.75rem", { lineHeight: "1rem" }],  // 12px
        "sm": ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
        "base": ["1rem", { lineHeight: "1.5rem" }],     // 16px
        "lg": ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
        "xl": ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
        "5xl": ["3rem", { lineHeight: "1.16" }],        // 48px
      },
      screens: {
        xs: '475px',
        small: '640px',  // 定義 small breakpoint
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
      },
      animation: {
        'option-select': 'option-select 0.2s ease-out',
        'indicator-appear': 'indicator-appear 0.15s ease-out',
      },
      keyframes: {
        'option-select': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1.05)' },
        },
        'indicator-appear': {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addUtilities, theme }) {
      addUtilities({
        // 標題等級系統
        '.h1': {
          fontSize: theme('fontSize.2xl')[0],
          lineHeight: theme('fontSize.2xl')[1].lineHeight,
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: '300',
          letterSpacing: '0.2em',
          marginBottom: theme('spacing.4'),
          '@screen md': {
            fontSize: '2rem',
            lineHeight: '1.2',
          }
        },
        '.h2': {
          fontFamily: "'Noto Sans TC', sans-serif",
          color: theme('colors.gray.600'),
          fontSize: theme('fontSize.base')[0],
          lineHeight: theme('fontSize.base')[1].lineHeight,
          fontWeight: '400'
        },
        '.h3': {
          fontSize: theme('fontSize.xl')[0],
          lineHeight: theme('fontSize.xl')[1].lineHeight,
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: '400',
          letterSpacing: '0.1em'
        },
        
        // 統一容器樣式
        '.content-container': {
          maxWidth: theme('maxWidth.4xl'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen md': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          }
        },
        
        '.section-container': {
          marginBottom: theme('spacing.16'),
          textAlign: 'center',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen md': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          }
        },
        
        // 向後相容的舊樣式類別
        '.section-heading': {
          fontSize: theme('fontSize.3xl')[0],
          lineHeight: theme('fontSize.3xl')[1].lineHeight,
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: '300',
          letterSpacing: '0.2em',
          marginBottom: theme('spacing.4'),
          '@screen md': {
            fontSize: theme('fontSize.4xl')[0],
            lineHeight: theme('fontSize.4xl')[1].lineHeight,
          }
        },
        '.section-subheading': {
          fontFamily: "'Noto Sans TC', sans-serif",
          color: theme('colors.gray.600')
        },
        
        // 文字樣式工具類
        '.text-content': {
          fontSize: theme('fontSize.base')[0],
          lineHeight: theme('fontSize.base')[1].lineHeight,
          color: theme('colors.gray.700')
        }
      })
    }
  ],
}
