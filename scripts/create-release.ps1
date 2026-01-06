# create-release.ps1 - Helper script to create a release (PowerShell)
# Usage: .\scripts\create-release.ps1 [major|minor|patch]

param(
    [Parameter(Position=0)]
    [ValidateSet('major', 'minor', 'patch')]
    [string]$VersionBump = 'patch'
)

# Function to print colored output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we're on the main branch
$CurrentBranch = git rev-parse --abbrev-ref HEAD
if ($CurrentBranch -ne "main") {
    Write-Warning "You're not on the main branch (current: $CurrentBranch)"
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        exit 1
    }
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Error "You have uncommitted changes. Please commit or stash them first."
    exit 1
}

Write-Info "Running pre-release checks..."

# Run tests
Write-Info "Running tests..."
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Tests failed. Please fix them before releasing."
    exit 1
}

# Run linting
Write-Info "Running linter..."
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Error "Linting failed. Please fix issues before releasing."
    exit 1
}

# Type check
Write-Info "Running type check..."
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Error "Type checking failed. Please fix issues before releasing."
    exit 1
}

# Bump version
Write-Info "Bumping $VersionBump version..."
npm version $VersionBump --no-git-tag-version

# Get new version
$packageJson = Get-Content package.json | ConvertFrom-Json
$NewVersion = $packageJson.version
Write-Info "New version: v$NewVersion"

# Prompt to update CHANGELOG
Write-Warning "Please update CHANGELOG.md with release notes for v$NewVersion"
Read-Host "Press Enter when CHANGELOG.md is updated"

# Commit version bump and changelog
Write-Info "Committing version bump and changelog..."
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to v$NewVersion"

# Create tag
Write-Info "Creating tag v$NewVersion..."
git tag -a "v$NewVersion" -m "Release v$NewVersion"

# Push to remote
Write-Info "Pushing to remote..."
git push origin main
git push origin "v$NewVersion"

# Build package
Write-Info "Building package..."
npm run package

# Show next steps
Write-Host ""
Write-Info "✅ Release v$NewVersion created successfully!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Go to: https://github.com/IngSoft-FacultyHub-2024-2/teachme.ai/releases"
Write-Host "2. Click 'Draft a new release'"
Write-Host "3. Select tag: v$NewVersion"
Write-Host "4. Upload: teachme-ai-$NewVersion.tgz"
Write-Host "5. Copy release notes from CHANGELOG.md"
Write-Host "6. Publish the release"
Write-Host ""
Write-Host "Or wait for GitHub Actions to create the release automatically!"
