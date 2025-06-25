const basePlugins = [
  [
    '@semantic-release/commit-analyzer',
    {
      preset: 'conventionalcommits',
      releaseRules: [
        {
          breaking: true,
          release: 'major'
        },
        {
          type: 'feat',
          release: 'minor'
        },
        {
          type: 'fix',
          release: 'patch'
        },
        {
          type: 'style',
          release: 'patch'
        },
        {
          type: 'refactor',
          release: 'patch'
        },
        {
          type: 'chore',
          release: 'patch'
        },
        {
          type: 'docs',
          release: 'patch'
        },
        {
          type: 'test',
          release: 'patch'
        },
        {
          type: 'ci',
          release: 'patch'
        },
        {
          type: 'build',
          release: 'patch'
        }
      ]
    }
  ]
];

const config = {
  branches: ['main'],
  plugins: [
    // Full release with changelog - groups all commits since last release
    ...basePlugins,
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    '@semantic-release/changelog',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]'
      }
    ]
  ]
};

export default config;
