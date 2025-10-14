module.exports = {
  extends: ["next/core-web-vitals", "@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  settings: {
    // 讓 ESLint 的 import 規則能解析 tsconfig 的路徑別名（如 @lib/*）
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // 生產環境嚴格規則
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    // 修復 Next.js 規則問題
    '@next/next/no-html-link-for-pages': 'off',
    '@next/next/no-page-custom-font': 'off', // 暫時關閉有問題的規則
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    'dist/',
    'public/',
    '*.config.js',
    '*.config.ts',
  ],
}
