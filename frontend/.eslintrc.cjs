module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  extends: [
    'prettier',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'standard-with-typescript'
  ],
  overrides: [
    {
      files: [
        '**/*.stories.*',
        '**/stories/storyMocks.tsx'
      ],
      rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        'react/display-name': 'off',
        'import/no-anonymous-default-export': 'off'
      }
    },
    {
      'files': [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)'
      ],
      'extends': [
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended'
      ],
      'rules': {
        'react/display-name': 'off',
        'testing-library/no-render-in-setup': [
          'error',
          {
            'allowTestingFrameworkSetupHook': 'beforeEach'
          }
        ],
        'testing-library/no-node-access': 'off'
      }
    }
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    'graphql',
    'testing-library',
    'jest-dom',
    'unused-imports',
    'jsx-a11y',
  ],
  rules: {// Review what rules can be resolved with autofix and turn them on
    '@typescript-eslint/quotes': 'off',//we should be more consistent with this
    'quotes': 'off',
    '@typescript-eslint/semi': 'off',
    'semi': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'comma-dangle': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    'quote-props': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/indent': 'off',
    'react/jsx-key': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    'prefer-const': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-invalid-void-type':'off',
    'object-shorthand': 'off',
    'spaced-comment': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'graphql/template-strings': [
      'error',
      {
        'env': 'apollo'
      }
    ],
    'graphql/named-operations': [
      'error'
    ],
    'import/no-unresolved': 0,
    'import/first': 1,
    'import/order': [
      1,
      {
        'newlines-between': 'always'
      }
    ],
    'import/newline-after-import': 1,
    'import/no-commonjs': 0,
    'import/no-named-as-default': 0,
    'react/prop-types': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'multiline-ternary': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/brace-style': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    'prefer-promise-reject-errors': 'off',
    'promise/param-names': 'off',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare':'off',
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/prefer-ts-expect-error': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    'react/no-children-prop': 'warn',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/prefer-reduce-type-parameter':'off',
    'prefer-regex-literals': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/prefer-includes': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    'no-unneeded-ternary': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-base-to-string': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'n/no-callback-literal': 'off',
    'react/no-children-prop':'off'
  },
};
