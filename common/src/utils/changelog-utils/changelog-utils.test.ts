import { describe, expect, it } from 'vitest';
import { ChangelogParser } from './changelog-utils.js';

describe('ChangelogParser regex constants', () => {
  it('should export the correct regex patterns', () => {
    expect(ChangelogParser.VERSION_REGEX.toString()).toBe(
      '/^#+\\s*\\[(\\d+\\.\\d+\\.\\d+)\\].*\\((\\d{4}-\\d{2}-\\d{2})\\)/'
    );
    expect(ChangelogParser.SECTION_REGEX.toString()).toBe('/^###\\s*(.+)$/');
    expect(ChangelogParser.COMMIT_LINK_REGEX.toString()).toBe('/\\[([a-f0-9]{7,40})\\]\\([^)]+\\)/');
    expect(ChangelogParser.SCOPED_COMMIT.toString()).toBe('/^\\*\\*([^:]+):\\*\\*\\s*(.+)/');
  });

  describe('VERSION_REGEX', () => {
    it('should match version headers with different heading levels', () => {
      const validVersions = [
        '# [2.20.0](https://github.com/example/repo/compare/v2.19.0...v2.20.0) (2025-06-25)',
        '## [1.5.3](link) (2023-12-01)',
        '### [0.1.0](another-link) (2021-01-01)',
        '#### [10.20.30](link) (2025-01-01)'
      ];

      validVersions.forEach((version) => {
        const match = version.match(ChangelogParser.VERSION_REGEX);
        expect(match).toBeTruthy();
        expect(match![1]).toMatch(/^\d+\.\d+\.\d+$/);
        expect(match![2]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should extract version and date correctly', () => {
      const version = '## [2.18.1](link) (2023-05-15)';
      const match = version.match(ChangelogParser.VERSION_REGEX);

      expect(match![1]).toBe('2.18.1');
      expect(match![2]).toBe('2023-05-15');
    });

    it('should not match invalid version formats', () => {
      const invalidVersions = [
        '[2.20.0] (2025-06-25)',
        '# 2.20.0 (2025-06-25)',
        '# [2.20] (2025-06-25)',
        '# [2.20.0] 2025-06-25',
        '# [2.20.0](link) (25-06-25)',
        'Random text [2.20.0](link) (2025-06-25)'
      ];

      invalidVersions.forEach((version) => {
        expect(version.match(ChangelogParser.VERSION_REGEX)).toBeNull();
      });
    });
  });

  describe('SECTION_REGEX', () => {
    it('should match section headers', () => {
      const validSections = [
        '### Features',
        '### Bug Fixes',
        '### BREAKING CHANGES',
        '### Performance Improvements',
        '### Documentation',
        '### Code Refactoring'
      ];

      validSections.forEach((section) => {
        const match = section.match(ChangelogParser.SECTION_REGEX);
        expect(match).toBeTruthy();
        expect(match![1]).toBe(section.substring(4));
      });
    });

    it('should not match non-section headers', () => {
      expect(ChangelogParser.SECTION_REGEX.test('## Features')).toBe(false);
      expect(ChangelogParser.SECTION_REGEX.test('Features')).toBe(false);
      expect(ChangelogParser.SECTION_REGEX.test(' ### Features')).toBe(false);
    });
  });

  describe('COMMIT_LINK_REGEX', () => {
    it('should match commit links with various hash lengths', () => {
      const validCommitLinks = [
        '[abc1234](https://github.com/user/repo/commit/abc1234)',
        '[abcdef1234567890](link)',
        '[a1b2c3d4e5f6](short-link)',
        '[1234567890abcdef1234567890abcdef12345678](full-hash-link)'
      ];

      validCommitLinks.forEach((link) => {
        const match = link.match(ChangelogParser.COMMIT_LINK_REGEX);
        expect(match).toBeTruthy();
        expect(match![1]).toMatch(/^[a-f0-9]{7,40}$/);
      });
    });

    it('should extract commit hash correctly', () => {
      const commitLink = 'Some text [abc1234](https://github.com/user/repo/commit/abc1234) more text';
      const match = commitLink.match(ChangelogParser.COMMIT_LINK_REGEX);

      expect(match![1]).toBe('abc1234');
    });

    it('should not match invalid commit links', () => {
      const invalidCommitLinks = [
        '[123456](link)',
        '[abcdef](link)',
        '[ABCDEF1234567890](link)',
        '[abc123g](link)',
        '[](link)',
        'abc1234(link)',
        '[abc1234]'
      ];

      invalidCommitLinks.forEach((link) => {
        expect(link.match(ChangelogParser.COMMIT_LINK_REGEX)).toBeNull();
      });
    });
  });

  describe('SCOPED_COMMIT', () => {
    it('should match scoped commit formats', () => {
      const validScopedCommits = [
        '**api:** Add new endpoint',
        '**ui:** Fix button alignment',
        '**auth:** Update authentication method',
        '**backend-service:** Optimize database queries',
        '**frontend/components:** Add new component'
      ];

      validScopedCommits.forEach((commit) => {
        const match = commit.match(ChangelogParser.SCOPED_COMMIT);
        expect(match).toBeTruthy();
        expect(match![1]).toBeTruthy();
        expect(match![2]).toBeTruthy();
      });
    });

    it('should extract scope and description correctly', () => {
      const scopedCommit = '**auth:** Update user authentication flow';
      const match = scopedCommit.match(ChangelogParser.SCOPED_COMMIT);

      expect(match![1]).toBe('auth');
      expect(match![2]).toBe('Update user authentication flow');
    });

    it('should not match invalid scoped formats', () => {
      const invalidScopedCommits = [
        '*api:* Add new endpoint',
        '**api** Add new endpoint',
        '**api: Add new endpoint',
        'api:** Add new endpoint',
        '**: Add new endpoint',
        '**:** Add new endpoint',
        'Add new endpoint'
      ];

      invalidScopedCommits.forEach((commit) => {
        expect(commit.match(ChangelogParser.SCOPED_COMMIT)).toBeNull();
      });
    });
  });
});

describe('ChangelogParser', () => {
  it('should parse version and date correctly', () => {
    const changelog = `
    # [2.20.0](https://github.com/example/repo/compare/v2.19.0...v2.20.0) (2025-06-25)

    ### Features

    * Add new feature ([abc1234](https://github.com/example/repo/commit/abc1234))
    `;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases).toHaveLength(1);
    expect(releases[0].version).toBe('2.20.0');
    expect(releases[0].date).toBe('2025-06-25');
    expect(releases[0].type).toBe('minor');
  });

  it('should categorize release types correctly', () => {
    const changelog = `
    # [3.0.0](link) (2025-01-01)
    ## [2.1.0](link) (2025-01-02)
    ### [2.0.1](link) (2025-01-03)`;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases[0].type).toBe('major');
    expect(releases[1].type).toBe('minor');
    expect(releases[2].type).toBe('patch');
  });

  it('should parse features and bug fixes into correct categories', () => {
    const changelog = `
    # [1.0.0](link) (2025-01-01)

    ### Features

    * Add user authentication ([abc1234](link))
    * **api:** Add new endpoint ([def5678](link))

    ### Bug Fixes

    * Fix memory leak ([ghi9012](link))
    * **ui:** Fix button alignment ([jkl3456](link))
    `;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases[0].features).toHaveLength(2);
    expect(releases[0].bugFixes).toHaveLength(2);
    expect(releases[0].features[0].description).toBe('Add user authentication');
    expect(releases[0].features[1].scope).toBe('api');
    expect(releases[0].features[1].description).toBe('Add new endpoint');
  });

  it('should detect breaking changes from exclamation mark', () => {
    const changelog = `
    # [2.0.0](link) (2025-01-01)

    ### Features

    * feat!: Remove deprecated API ([abc1234](link))
    * **auth!:** Change authentication method ([def5678](link))

    ### Bug Fixes

    * fix!: Change return type of getUser ([ghi9012](link))
    `;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases[0].breakingChanges).toHaveLength(3);
    expect(releases[0].features).toHaveLength(0);
    expect(releases[0].bugFixes).toHaveLength(0);
    expect(releases[0].breakingChanges[0].isBreaking).toBe(true);
    expect(releases[0].breakingChanges[0].description).toContain('Remove deprecated API');
  });

  it('should detect breaking changes that appear before section headers', () => {
    const changelog = `
    # [2.0.0](link) (2025-04-24)

    * fix(auth)!: patreon supporter status links correctly ([bb3b791](link))

    ### Bug Fixes

    * metronome and shard magnet skill levels ([e9a4907](link))

    ### BREAKING CHANGES

    * Google client needs a redirect uri now and
    the API has been updated with new required headers.
    `;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases).toHaveLength(1);
    expect(releases[0].breakingChanges).toHaveLength(1);
    expect(releases[0].breakingChanges[0].commit).toBe('bb3b791');
    expect(releases[0].breakingChanges[0].description).toBe('fix(auth)!: patreon supporter status links correctly');
    expect(releases[0].breakingChanges[0].isBreaking).toBe(true);
    expect(releases[0].bugFixes).toHaveLength(1);
    expect(releases[0].bugFixes[0].description).toBe('metronome and shard magnet skill levels');
  });

  it('should handle commits without links', () => {
    const changelog = `
    # [1.0.0](link) (2025-01-01)

    ### Features

    * Add feature without commit link
    * Add another feature
    `;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases[0].features).toHaveLength(2);
    expect(releases[0].features[0].commit).toBe('unknown');
    expect(releases[0].features[0].description).toBe('Add feature without commit link');
  });

  it('should handle empty sections', () => {
    const changelog = `
    # [1.0.0](link) (2025-01-01)

    ### Features

    ### Bug Fixes

    * Fix issue ([abc1234](link))
    `;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases[0].features).toHaveLength(0);
    expect(releases[0].bugFixes).toHaveLength(1);
  });

  it('should handle multiple releases', () => {
    const changelog = `
    # [2.0.0](link) (2025-01-02)

    ### Features

    * Add feature 2 ([def5678](link))

    # [1.0.0](link) (2025-01-01)

    ### Features

    * Add feature 1 ([abc1234](link))
    `;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases).toHaveLength(2);
    expect(releases[0].version).toBe('2.0.0');
    expect(releases[1].version).toBe('1.0.0');
  });

  it('should handle other change types', () => {
    const changelog = `
    # [1.0.0](link) (2025-01-01)

    ### Documentation

    * Update README ([abc1234](link))

    ### Performance Improvements

    * Optimize database queries ([def5678](link))

    ### Chores

    * Update dependencies ([ghi9012](link))
    `;

    const releases = ChangelogParser.parseChangelog(changelog);
    expect(releases[0].otherChanges).toHaveLength(3);
    expect(releases[0].features).toHaveLength(0);
    expect(releases[0].bugFixes).toHaveLength(0);
  });
});
