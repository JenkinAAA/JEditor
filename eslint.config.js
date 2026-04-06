import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  eslint.configs.recommended,
  prettierPlugin,
  prettierConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '.idea/**', '.claude/**'],
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      // 允许使用尚未被正式支持的一些特性而不需要显式导入等
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    files: ['test/**/*.js', 'test/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
]
