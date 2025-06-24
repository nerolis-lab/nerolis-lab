/* eslint-env node */
/* eslint-disable SleepAPILogger/no-console */
import fs from 'fs';
import path from 'path';

// Exit if running in a CI environment
if (process.env.CI) {
  console.log('CI environment detected. Skipping git hook installation.');
  process.exit(0);
}

const hookSource = path.resolve('.github', 'commit-msg');
const gitRoot = path.resolve('.git');

// Exit if .git directory doesn't exist (e.g., in a shallow clone or downloaded zip)
if (!fs.existsSync(gitRoot) || !fs.statSync(gitRoot).isDirectory()) {
  console.log('.git directory not found. Skipping hook installation.');
  process.exit(0);
}

const hookTarget = path.resolve(gitRoot, 'hooks', 'commit-msg');

try {
  fs.copyFileSync(hookSource, hookTarget);
  // On Windows, executability is handled differently.
  // On Unix-like systems, we need to set the executable bit.
  if (process.platform !== 'win32') {
    fs.chmodSync(hookTarget, '755');
  }

  console.log('Git hook installed successfully.');
} catch (error) {
  console.error('Failed to install git hook:', error);
}
