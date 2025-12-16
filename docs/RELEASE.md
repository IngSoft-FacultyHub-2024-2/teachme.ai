# Release Guide

This document describes how to create and publish releases for TeachMe.AI.

## Release Checklist

Before creating a release, ensure:

- [ ] All tests pass: `npm test`
- [ ] Code is properly formatted: `npm run format:check`
- [ ] No linting errors: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] CHANGELOG.md is updated with changes
- [ ] Version in package.json is updated
- [ ] All changes are committed to main branch
- [ ] README.md is up to date

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **Major (X.0.0)**: Breaking changes
- **Minor (1.X.0)**: New features, backwards compatible
- **Patch (1.0.X)**: Bug fixes, backwards compatible

## Release Methods

### Method 1: Manual Release (Recommended for First Release)

#### Step 1: Update Version and Changelog

```bash
# Update version in package.json (or use npm version)
npm version minor  # or major/patch

# Update CHANGELOG.md with release notes
# Move items from [Unreleased] to [X.Y.Z] section
```

#### Step 2: Commit and Create Tag

```bash
# Commit version changes
git add package.json CHANGELOG.md
git commit -m "chore: bump version to v1.0.0"

# Create and push tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0
```

#### Step 3: Build Package

```bash
# Build and create tarball
npm run package

# Verify the tarball
ls -lh teachme-ai-*.tgz
```

#### Step 4: Create GitHub Release

**Option A: Via Web UI**

1. Go to: https://github.com/IngSoft-FacultyHub-2024-2/teachme.ai/releases
2. Click "Draft a new release"
3. Select tag: `v1.0.0`
4. Release title: `v1.0.0 - NPM Binary Package`
5. Copy release notes from CHANGELOG.md
6. Attach files:
   - `teachme-ai-1.0.0.tgz`
   - `.env.example` (optional)
7. Click "Publish release"

**Option B: Via GitHub CLI**

```bash
gh release create v1.0.0 \
  teachme-ai-1.0.0.tgz \
  .env.example \
  --title "v1.0.0 - NPM Binary Package" \
  --notes-file CHANGELOG.md
```

### Method 2: Automated Release (GitHub Actions)

The repository includes a GitHub Actions workflow (`.github/workflows/release.yml`) that automatically creates releases when you push a tag.

#### Usage:

```bash
# Update version and changelog
npm version minor
# Update CHANGELOG.md

# Commit changes
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to v1.1.0"

# Push to main
git push origin main

# Create and push tag (this triggers the workflow)
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

The workflow will:
1. Checkout code
2. Install dependencies
3. Run tests
4. Build and package
5. Create GitHub release with tarball attached

### Method 3: Quick Patch Release

For urgent bug fixes:

```bash
# Make your bug fix
git add .
git commit -m "fix: critical bug description"

# Bump patch version
npm version patch

# Push and tag
git push origin main
git push origin v1.0.1
```

## Post-Release Tasks

After creating a release:

1. **Verify the release**
   - Check GitHub Releases page
   - Download and test the tarball
   - Verify installation works: `npm install -g ./teachme-ai-X.Y.Z.tgz`

2. **Announce the release** (optional)
   - Update project documentation
   - Notify users/team
   - Post on social media if applicable

3. **Plan next release**
   - Update CHANGELOG.md [Unreleased] section
   - Create issues for planned features

## Release Templates

### CHANGELOG Entry Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature descriptions

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```

### GitHub Release Notes Template

```markdown
## TeachMe.AI vX.Y.Z

### 🎉 What's New

Brief description of the release.

### 📦 Installation

**Install from this release:**
\`\`\`bash
npm install -g ./teachme-ai-X.Y.Z.tgz
teachme
\`\`\`

### ✨ Changes

- Feature 1
- Feature 2
- Bug fix 1

### 📋 Requirements

- Node.js 20+
- OpenAI API key

### 📖 Full Changelog

[Compare changes](https://github.com/IngSoft-FacultyHub-2024-2/teachme.ai/compare/vX.Y.Z-1...vX.Y.Z)
```

## Troubleshooting

### Tag Already Exists

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Create new tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Failed GitHub Actions Workflow

1. Check workflow logs in GitHub Actions tab
2. Fix the issue locally
3. Delete and recreate the tag
4. Push the tag again to re-trigger the workflow

### Package Build Fails

```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
npm run package
```

## Additional Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [npm version Documentation](https://docs.npmjs.com/cli/v10/commands/npm-version)
