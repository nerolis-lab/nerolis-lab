export interface ChangelogEntry {
  commit: string;
  description: string;
  scope?: string;
  isBreaking?: boolean;
}

export interface Release {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  features: ChangelogEntry[];
  bugFixes: ChangelogEntry[];
  breakingChanges: ChangelogEntry[];
  otherChanges: ChangelogEntry[];
}
