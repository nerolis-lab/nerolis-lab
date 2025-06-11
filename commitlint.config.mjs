/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Warn if commit message is more than 50 characters
    'header-max-length': [1, 'always', 50],

    // Warn if body line is more than 72 characters
    'body-max-line-length': [1, 'always', 72],

    'type-enum': [
      2,
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf', // A code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'build', // Changes that affect the build system or external dependencies
        'ci', // Changes to our CI configuration files and scripts
        'chore', // Miscellaneous changes
        'revert' // Reverts a previous commit
      ]
    ],

    // Warn if subject in header is sentence-case
    'subject-case': [1, 'never', 'sentence-case'],

    // Warn if subject ends with a period
    'subject-full-stop': [1, 'never', '.'],

    // Warn if body and footer have no blank lines before them
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always']
  },
  helpUrl: 'https://www.conventionalcommits.org/en/v1.0.0/'
};
