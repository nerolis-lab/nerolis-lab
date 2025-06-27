import type { ChangelogEntry, Release } from '../../types/changelog/changelog-types';

export class ChangelogParser {
  static readonly VERSION_REGEX = /^#+\s*\[(\d+\.\d+\.\d+)\].*\((\d{4}-\d{2}-\d{2})\)/;
  static readonly SECTION_REGEX = /^###\s*(.+)$/;
  static readonly COMMIT_LINK_REGEX = /\[([a-f0-9]{7,40})\]\([^)]+\)/;
  static readonly SCOPED_COMMIT = /^\*\*([^:]+):\*\*\s*(.+)/;

  static parseChangelog(content: string): Release[] {
    const lines = content.split('\n');
    const releases: Release[] = [];
    let currentRelease: Release | null = null;
    let currentSection: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check for version header
      const versionMatch = trimmedLine.match(ChangelogParser.VERSION_REGEX);
      if (versionMatch) {
        // Save previous release if exists
        if (currentRelease) {
          releases.push(currentRelease);
        }

        // Create new release
        const [, version, date] = versionMatch;
        currentRelease = {
          version,
          date,
          type: ChangelogParser.getReleaseType(version),
          features: [],
          bugFixes: [],
          breakingChanges: [],
          otherChanges: []
        };
        currentSection = null;
        continue;
      }

      // Check for section headers
      const sectionMatch = trimmedLine.match(ChangelogParser.SECTION_REGEX);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        continue;
      }

      // Parse commit entries (but not under BREAKING CHANGES section unless they have commit links)
      if (currentRelease && trimmedLine.startsWith('*')) {
        // If we're in a BREAKING CHANGES section, only process lines that look like actual commits (with commit links)
        if (currentSection === 'BREAKING CHANGES' && !ChangelogParser.COMMIT_LINK_REGEX.test(trimmedLine)) {
          // This is narrative text, not a commit entry - skip it
          continue;
        }

        const entry = ChangelogParser.parseCommitEntry(trimmedLine);
        if (entry) {
          // Categorize the entry - breaking changes take priority
          if (entry.isBreaking) {
            currentRelease.breakingChanges.push(entry);
          } else if (currentSection === 'Features') {
            currentRelease.features.push(entry);
          } else if (currentSection === 'Bug Fixes') {
            currentRelease.bugFixes.push(entry);
          } else if (currentSection === 'BREAKING CHANGES') {
            // Handle entries in BREAKING CHANGES section
            currentRelease.breakingChanges.push(entry);
          } else {
            currentRelease.otherChanges.push(entry);
          }
        }
      }
    }

    // Save last release if exists
    if (currentRelease) {
      releases.push(currentRelease);
    }

    return releases;
  }

  private static parseCommitEntry(line: string): ChangelogEntry {
    // Remove the leading asterisk
    const content = line.substring(1).trim();

    // Extract commit hash
    const commitMatch = content.match(ChangelogParser.COMMIT_LINK_REGEX);
    const commit = commitMatch ? commitMatch[1] : 'unknown';

    // Remove commit link from content
    let cleanContent = content.replace(ChangelogParser.COMMIT_LINK_REGEX, '').trim();
    cleanContent = cleanContent.replace(/\(\)$/, '').trim();

    // Check for scoped format with breaking change
    const scopedBreakingMatch = cleanContent.match(/^\*\*([^:]+)!:\*\*\s*(.+)/);
    if (scopedBreakingMatch) {
      const [, scope, description] = scopedBreakingMatch;
      return {
        commit,
        scope: scope.trim(),
        description: description.trim(),
        isBreaking: true
      };
    }

    // Check for scoped format without breaking change
    const scopedMatch = cleanContent.match(ChangelogParser.SCOPED_COMMIT);
    if (scopedMatch) {
      const [, scope, description] = scopedMatch;
      return {
        commit,
        scope: scope.trim(),
        description: description.trim(),
        isBreaking: false
      };
    }

    // Check for breaking change in description
    // Look for patterns like "type!:" or "type(scope)!:"
    const breakingChangePattern = /(feat|fix|refactor|perf|build|ci|chore|style|docs|test|revert)(\(.+?\))?!:/;
    const isBreaking = breakingChangePattern.test(cleanContent);

    return {
      commit,
      description: cleanContent,
      isBreaking
    };
  }

  private static getReleaseType(version: string): 'major' | 'minor' | 'patch' {
    const [, minor, patch] = version.split('.').map(Number);

    if (minor === 0 && patch === 0) {
      return 'major';
    } else if (patch === 0) {
      return 'minor';
    }
    return 'patch';
  }
}
