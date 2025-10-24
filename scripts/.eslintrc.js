module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'unused-imports',
    'import'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  rules: {
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index']
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }
    ],
    'import/no-duplicates': 'error',
    'import/no-named-as-default-member': 'off',
    'import/no-unresolved': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off'
  },
  settings: {
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
      node: { extensions: ['.js', '.ts', '.jsx', '.tsx'] }
    }
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'scripts/',
    'next.config.js',
    'tailwind.config.js'
  ]
};
