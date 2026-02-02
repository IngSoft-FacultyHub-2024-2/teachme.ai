#!/bin/bash

# create-release.sh - Helper script to create a release
# Usage: ./scripts/create-release.sh [major|minor|patch]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if version bump type is provided
VERSION_BUMP=${1:-patch}

if [[ ! "$VERSION_BUMP" =~ ^(major|minor|patch)$ ]]; then
    print_error "Invalid version bump type: $VERSION_BUMP"
    echo "Usage: $0 [major|minor|patch]"
    exit 1
fi

# Check if we're on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're not on the main branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

print_info "Running pre-release checks..."

# Run tests
print_info "Running tests..."
if ! npm test; then
    print_error "Tests failed. Please fix them before releasing."
    exit 1
fi

# Run linting
print_info "Running linter..."
if ! npm run lint; then
    print_error "Linting failed. Please fix issues before releasing."
    exit 1
fi

# Type check
print_info "Running type check..."
if ! npm run type-check; then
    print_error "Type checking failed. Please fix issues before releasing."
    exit 1
fi

# Bump version
print_info "Bumping $VERSION_BUMP version..."
npm version $VERSION_BUMP --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
print_info "New version: v$NEW_VERSION"

# Prompt to update CHANGELOG
print_warning "Please update CHANGELOG.md with release notes for v$NEW_VERSION"
read -p "Press Enter when CHANGELOG.md is updated..."

# Commit version bump and changelog
print_info "Committing version bump and changelog..."
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to v$NEW_VERSION"

# Create tag
print_info "Creating tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push to remote
print_info "Pushing to remote..."
git push origin main
git push origin "v$NEW_VERSION"

# Build package
print_info "Building package..."
npm run package

# Show next steps
echo ""
print_info "✅ Release v$NEW_VERSION created successfully!"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/IngSoft-FacultyHub-2024-2/teachme.ai/releases"
echo "2. Click 'Draft a new release'"
echo "3. Select tag: v$NEW_VERSION"
echo "4. Upload: teachme-ai-$NEW_VERSION.tgz"
echo "5. Copy release notes from CHANGELOG.md"
echo "6. Publish the release"
echo ""
echo "Or wait for GitHub Actions to create the release automatically!"
