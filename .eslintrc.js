module.exports = {
  extends: ["next/core-web-vitals"],
  settings: {
    // 讓 ESLint 的 import 規則能解析 tsconfig 的路徑別名（如 @lib/*）
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // 先關掉有問題的 next 規則，等遷移 ESLint CLI 後再打開
    '@next/next/no-html-link-for-pages': 'off',
  },
}
