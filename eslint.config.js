// Configuratia ESLint a frontend-ului. Fiecare regula de aici corespunde unei
// sectiuni din CODING_STYLE.md; formatarea propriu-zisa este lasata Prettier.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'dist/', 'coverage/'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  jsdoc.configs['flat/recommended-error'],
  {
    files: ['**/*.{js,jsx}'],
    plugins: { 'react-refresh': reactRefresh },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // 3.1 Declaratii si variabile
      'no-var': 'error',
      'prefer-const': 'error',
      'one-var': ['error', 'never'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // 3.2 Denumiri
      camelcase: ['error', { properties: 'never' }],
      'new-cap': 'error',
      'id-length': ['error', { min: 2, exceptions: ['i', 'j', '_'] }],
      'react/jsx-pascal-case': 'error',
      'react/boolean-prop-naming': [
        'error',
        { rule: '^(is|has|can|show)[A-Z]([A-Za-z0-9]?)+' },
      ],

      // 3.3 Expresii si control
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-else-return': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'no-nested-ternary': 'error',

      // 3.4 Componente React
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', 'never'],
      'react/no-array-index-key': 'error',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': 'error',

      // 3.5 Gestionarea erorilor
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // 3.6 Dimensiunea codului
      'max-lines': [
        'error',
        { max: 250, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      complexity: ['error', 10],

      // 3.7 Comentarii JSDoc pentru tot ce este exportat
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
          },
        },
      ],
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-description': 'off',
    },
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'max-lines-per-function': 'off',
      'jsdoc/require-jsdoc': 'off',
    },
  },
  {
    // Scripturile Node rulate din terminal pot afisa mesaje informative.
    files: ['*.config.js', 'scripts/**'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    },
  },
  prettier,
];
