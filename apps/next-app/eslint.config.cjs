/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/require-await': 'off',
    'react/no-unescaped-entities': 'off',
  },
}

module.exports = config