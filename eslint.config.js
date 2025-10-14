import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import nextPlugin from '@next/eslint-plugin-next'
import unusedImports from 'eslint-plugin-unused-imports'
import sonarjs from 'eslint-plugin-sonarjs'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      '@next/next': nextPlugin,
      'unused-imports': unusedImports,
      'sonarjs': sonarjs,
      'jsdoc': jsdoc,
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
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'off', // 使用 TypeScript 版本
      'no-undef': 'off', // TypeScript 處理
      
      // 進階代碼品質規則 - Unused Imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { 
          vars: 'all', 
          varsIgnorePattern: '^_', 
          args: 'after-used', 
          argsIgnorePattern: '^_' 
        }
      ],
      
      // SonarJS 代碼品質規則
      'sonarjs/cognitive-complexity': ['error', 15], // 認知複雜度限制
      'sonarjs/no-duplicate-string': ['error', { threshold: 5 }], // 重複字串檢查
      'sonarjs/no-identical-functions': 'error', // 重複函數檢查
      'sonarjs/no-redundant-boolean': 'error', // 冗余布林值
      'sonarjs/no-unused-collection': 'error', // 未使用的集合
      'sonarjs/prefer-immediate-return': 'error', // 優先直接返回
      'sonarjs/no-small-switch': 'error', // 避免小型 switch
      'sonarjs/no-duplicated-branches': 'error', // 重複分支
      'sonarjs/no-all-duplicated-branches': 'error', // 所有重複分支
      'sonarjs/no-element-overwrite': 'error', // 元素覆寫
      'sonarjs/no-extra-arguments': 'error', // 多餘參數
      'sonarjs/no-gratuitous-expressions': 'error', // 無用表達式
      'sonarjs/no-inverted-boolean-check': 'error', // 反轉布林檢查
      'sonarjs/no-redundant-jump': 'error', // 冗余跳轉
      'sonarjs/no-same-line-conditional': 'error', // 同行條件判斷
      'sonarjs/no-useless-catch': 'error', // 無用的 catch
      'sonarjs/prefer-object-literal': 'error', // 優先對象字面量
      'sonarjs/prefer-single-boolean-return': 'error', // 單一布林返回
      
      // JSDoc 文檔規則
      'jsdoc/require-description': 'warn', // 要求描述
      'jsdoc/require-param-description': 'warn', // 要求參數描述
      'jsdoc/require-returns-description': 'warn', // 要求返回值描述
      'jsdoc/no-undefined-types': 'off', // TypeScript 處理類型
      'jsdoc/valid-types': 'off', // TypeScript 處理類型
      
      // Next.js 規則
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'warn',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',
      'public/',
      '*.config.js',
      '*.config.ts',
      '*.d.ts',
    ],
  },
]