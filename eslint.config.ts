/* eslint-disable @typescript-eslint/no-explicit-any */

import typescriptEslint from 'typescript-eslint';

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
      ...vuetify.configs['flat/recommended']
    ]
  },

  // backend-specific rules
  {
    name: 'sleepapi/backend-rules',
    files: ['**/backend/**', '**/common/**', '**/bot/**'],
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
  }
);
