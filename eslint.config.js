// eslint.config.js
import eslint from '@eslint/js';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

const globalsUserscript = {
  GM_info: 'readonly',
  GM_xmlHttpRequest: 'readonly',
  GM_download: 'readonly',
  GM_setValue: 'readonly',
  GM_getValue: 'readonly',
  GM_deleteValue: 'readonly',
  GM_listValues: 'readonly',
  unsafeWindow: 'readonly',
};

export default [
  eslint.configs.recommended,
  {
    files: ['build/**/*.mjs', 'scripts/**/*.js'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    rules: {
      'no-console': 'off',
      'no-undef': 'error',
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globalsUserscript,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      curly: ['error', 'all'],
      semi: ['error', 'always'],
      'no-extra-semi': 'off',
      quotes: ['error', 'single'],
      'no-console': 'off',
      'max-len': [
        'warn',
        {
          code: 100,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],
      'brace-style': ['error', '1tbs'],
      indent: ['error', 2],
      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'arrow-spacing': 'error',
      'no-useless-computed-key': 'error',
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.vitest,
        ...globals.browser,
        ...globals.node,
        ...globalsUserscript,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'error',
      'no-unused-vars': [
        'warn',
        {
          args: 'none',
          varsIgnorePattern: '^(expect|test|describe|it|vi|context)$',
        },
      ],
    },
  },
  prettierPluginRecommended,
];
