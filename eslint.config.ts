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
    rules: {
      'SleepAPILogger/no-console': 'off'
    }
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
      SleepAPILogger: {
        rules: {
          'no-console': {
            meta: {
              type: 'problem',
              docs: {
                description: 'Disallow `console` usage and enforce `logger` usage',
                recommended: true
              },
              fixable: 'code',
              schema: []
            },
            create(context: any): any {
              return {
                CallExpression(node: any) {
                  if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === 'console' &&
                    node.callee.property.type === 'Identifier'
                  ) {
                    const method = node.callee.property.name;
                    context.report({
                      node,
                      message: `Use 'logger.${method}' instead of 'console.${method}'.`,
                      fix: (fixer: any) => fixer.replaceText(node.callee, `logger.${method}`)
                    });
                  }
                }
              };
            }
          },
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
                  // Check if entering transaction block
                  if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === 'DatabaseService' &&
                    node.callee.property.type === 'Identifier' &&
                    node.callee.property.name === 'transaction'
                  ) {
                    transactionDepth++;
                  }

                  // Check DAO method calls within transaction
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

                    // Check if last argument contains trx (either { trx } or options: { trx })
                    let hasTransactionOption = false;

                    if (args.length > 0) {
                      const lastArg = args[args.length - 1];
                      if (lastArg.type === 'ObjectExpression') {
                        // Check for direct { trx } format
                        const hasTrxDirect = lastArg.properties.some((prop: any) => {
                          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
                            return prop.key.name === 'trx';
                          }
                          return false;
                        });

                        // Check for options: { trx } format
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
      ],
      'SleepAPILogger/no-console': 'error',
      'SleepAPILogger/require-transaction-option': 'warn' // Warn for now, can change to 'error' later
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
