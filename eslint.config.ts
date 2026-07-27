/* eslint-disable @typescript-eslint/no-explicit-any */

import typescriptEslint from 'typescript-eslint';

import vueI18n from '@intlify/eslint-plugin-vue-i18n';
import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import vue from 'eslint-plugin-vue';
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';

import vuetify from 'eslint-plugin-vuetify';
import globals from 'globals';

export default typescriptEslint.config(
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/coverage',
      '**/.vscode',
      '**/dev-dist',
      '*.d.ts',
      '.venv/**',
      '**/cache/**',
      '**/.claude/**'
    ]
  },

  // github scripts
  {
    name: 'sleepapi/github-scripts',
    files: ['.github/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {}
  },

  // guides one-off Node scripts (e.g. emoji sync); not covered by frontend/backend globs
  {
    name: 'sleepapi/guides-scripts',
    files: ['**/guides/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node
      },
      sourceType: 'module'
    },
    rules: {}
  },

  // frontend-specific rules
  {
    name: 'sleepapi/frontend-rules',
    files: ['**/frontend/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
        APP_VERSION: 'readonly' // comes from vite
      },
      sourceType: 'module'
    },
    extends: [
      ...pluginVueA11y.configs['flat/recommended'],
      ...vue.configs['flat/recommended'],
      ...vuetify.configs['flat/recommended'],
      ...vueI18n.configs.recommended
    ],
    // vue-i18n typed t() only gives IDE autocomplete for translation keys,
    // it does not reject an invalid/typo'd key at compile time (the
    // underlying overload accepts any string so it can also support
    // dynamic keys) - this rule is what actually fails CI on a bad key.
    // NOTE: this currently only fires for t() calls in .ts files. This
    // block's extends already pulls in eslint-plugin-vue etc, but
    // typescript-eslint's config() helper re-scopes each extended config's
    // own `files` (e.g. vue's ['*.vue', '**/*.vue']) to this block's
    // broader `files: ['**/frontend/**']` instead of unioning them, which
    // means nothing in the final config array declares an explicit *.vue
    // pattern - so ESLint's directory-walk extension auto-discovery never
    // picks up .vue at all, and *no* rule from any of these extends (not
    // just this one) currently runs against .vue files via `eslint .`.
    // That's a pre-existing, repo-wide gap unrelated to i18n - fixing it
    // means giving this block (or a sibling one) explicit
    // `**/frontend/**/*.vue` + `**/frontend/**/*.ts` files, which would
    // also surface every already-broken vue/vuetify/a11y rule against
    // every .vue file at once. Deliberately left out of this PR's scope.
    rules: {
      '@intlify/vue-i18n/no-missing-keys': 'error'
    },
    settings: {
      'vue-i18n': {
        localeDir: './frontend/src/i18n/locales/*.json',
        messageSyntaxVersion: '^11.0.0'
      }
    }
  },

  // backend-specific rules
  {
    name: 'sleepapi/backend-rules',
    files: ['**/backend/**', '**/common/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser, // backend has swagger frontend
        ...globals.node
      },
      sourceType: 'module',
      parser: tsParser
    },
    plugins: { ts }
  },

  // general recommendations
  js.configs.recommended,
  typescriptEslint.configs.recommended,
  prettierConfig,
  prettierRecommended as any, // prettier last to avoid clash with autoformatting

  // final overwrite custom rules
  {
    plugins: {
      sleepapiTransactions: {
        rules: {
          'require-transaction-option': {
            meta: {
              type: 'problem',
              docs: {
                description: 'Require transaction option in DAO calls within transaction blocks',
                recommended: true
              },
              messages: {
                missingTransaction:
                  'DAO method "{{method}}" called within transaction block should include options: { trx } parameter'
              },
              schema: []
            },
            create(context: any): any {
              let transactionDepth = 0;
              const daoMethods: string[] = [
                'find',
                'get',
                'findMultiple',
                'insert',
                'update',
                'delete',
                'upsert',
                'findOrInsert',
                'batchInsert',
                'count'
              ];

              return {
                CallExpression(node: any) {
                  if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === 'DatabaseService' &&
                    node.callee.property.type === 'Identifier' &&
                    node.callee.property.name === 'transaction'
                  ) {
                    transactionDepth++;
                  }

                  if (
                    transactionDepth > 0 &&
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name?.endsWith('DAO') &&
                    node.callee.property.type === 'Identifier' &&
                    daoMethods.includes(node.callee.property.name)
                  ) {
                    const methodName = node.callee.property.name;
                    const args = node.arguments;

                    let hasTransactionOption = false;

                    if (args.length > 0) {
                      const lastArg = args[args.length - 1];
                      if (lastArg.type === 'ObjectExpression') {
                        const hasTrxDirect = lastArg.properties.some((prop: any) => {
                          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
                            return prop.key.name === 'trx';
                          }
                          return false;
                        });

                        const optionsProperty = lastArg.properties.find((prop: any) => {
                          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
                            return prop.key.name === 'options';
                          }
                          return false;
                        });

                        let hasTrxInOptions = false;
                        if (
                          optionsProperty &&
                          optionsProperty.type === 'Property' &&
                          optionsProperty.value.type === 'ObjectExpression'
                        ) {
                          hasTrxInOptions = optionsProperty.value.properties.some((prop: any) => {
                            if (prop.type === 'Property' && prop.key.type === 'Identifier') {
                              return prop.key.name === 'trx';
                            }
                            return false;
                          });
                        }

                        hasTransactionOption = hasTrxDirect || hasTrxInOptions;
                      }
                    }

                    if (!hasTransactionOption) {
                      context.report({
                        node,
                        messageId: 'missingTransaction',
                        data: { method: methodName }
                      });
                    }
                  }
                },

                'CallExpression:exit'(node: any) {
                  if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === 'DatabaseService' &&
                    node.callee.property.type === 'Identifier' &&
                    node.callee.property.name === 'transaction'
                  ) {
                    transactionDepth--;
                  }
                }
              };
            }
          }
        }
      }
    },
    rules: {
      'sleepapiTransactions/require-transaction-option': 'error',
      // turning this on means we can't do: someBoolean && someFunction()
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          reportUsedIgnorePattern: true
        }
      ]
    }
  },

  // Allow var in global type declarations for logger
  {
    files: ['**/logger/logger.ts'],
    rules: {
      'no-var': 'off'
    }
  },

  // module augmentation interfaces are inherently "empty" - the members
  // come from declaration merging with vue-i18n's own interface
  {
    files: ['**/i18n/schema.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  }
);
