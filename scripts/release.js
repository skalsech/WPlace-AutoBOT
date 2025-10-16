import { execSync } from 'child_process';
import { argv } from 'process';

if (argv.length < 3) {
  console.error('Usage: node scripts/release.js [patch|minor|major|version]');
  process.exit(1);
}

const versionType = argv[2];

try {
  const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString();
  const otherChanges = status
    .split('\n')
    .filter((line) => !line.includes('.github/RELEASE_NOTES.md'))
    .filter((line) => line.trim() !== '').length;
  if (otherChanges > 0) {
    console.error('❌ There are changes in other files. Please commit or stash them first.');
    process.exit(1);
  }

  const releaseNotesStatus = execSync('git status --porcelain .github/RELEASE_NOTES.md', {
    stdio: 'pipe',
  }).toString();
  if (releaseNotesStatus.trim() !== '') {
    console.log('Stashing release notes...');
    execSync(`git stash push -m "release notes for ${versionType}" .github/RELEASE_NOTES.md`);
  } else {
    console.log('No changes in .github/RELEASE_NOTES.md - skipping stash');
  }

  console.log(`Updating version to ${versionType}...`);
  execSync(`npm version ${versionType}`);

  console.log('Updating meta.js with new version...');
  execSync('node scripts/update-version.js');
  execSync('git add src/app/meta.js');

  console.log('Restoring release notes and adding to commit...');
  execSync('git stash pop');
  execSync('git add .github/RELEASE_NOTES.md');
  execSync('git commit --amend --no-edit');

  console.log('Updating tag to point to amended commit...');
  execSync(`git tag -f v${versionType}`);

  console.log('Pushing branch and tags...');
  execSync('git push origin custom-main');
  execSync('git push origin --tags');

  console.log('✅ Release created and pushed successfully!');
} catch (error) {
  console.error('❌ Release failed:', error.message);
  process.exit(1);
}
