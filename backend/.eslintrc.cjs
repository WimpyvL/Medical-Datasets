module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'node'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:node/recommended',
    'prettier'
  ],
  env: {
    node: true,
    es2021: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'node/no-unsupported-features/es-syntax': 'off',
    'import/no-unresolved': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      { checksVoidReturn: false }
    ]
  }
};
