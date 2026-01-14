# push-to-github.ps1
# Usage: run from the project folder (or double-click if PowerShell execution policy allows)
# This script sets your Git identity, commits untracked/changed files (if any),
# ensures branch `main`, adds the origin remote, and pushes to GitHub.

$ErrorActionPreference = 'Stop'

$gitName = 'muneeb nawaz'
$gitEmail = 'muneebbhutto0@gmail.com'
$remoteUrl = 'https://github.com/Muneebnawaz-develop/Mid-Term-Project_Base_SE.git'

# Check for git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in PATH. Install Git and re-run this script: https://git-scm.com/download/win"
    exit 1
}

# Set global config (won't overwrite if already set to the same values)
git config --global user.name "$gitName"
git config --global user.email "$gitEmail"
git config --global core.autocrlf true

# Ensure we're in the script folder (project root when run from there)
Set-Location -Path $PSScriptRoot
Write-Output "Working directory: $(Get-Location)"

# Initialize repo if needed
if (-not (Test-Path .git)) {
    Write-Output "Initializing git repository..."
    git init
} else {
    Write-Output "Git repository already initialized."
}

# Add remote (replace existing origin)
try {
    git remote remove origin 2>$null | Out-Null
} catch {
    # ignore
}

Write-Output "Adding remote origin -> $remoteUrl"
git remote add origin $remoteUrl

# Stage changes
Write-Output "Staging files..."
git add .

# If there are staged changes, commit; otherwise report
$porcelain = git status --porcelain
if ($porcelain) {
    Write-Output "Committing changes..."
    git commit -m "Initial commit"
} else {
    Write-Output "No changes to commit (working tree clean or only CRLF warnings)."
}

# Ensure main branch
git branch -M main

# If there is no commit yet, create an initial (possibly empty) commit so we can push
$hasCommit = $false
try {
    git rev-parse --verify HEAD > $null 2>&1
    $hasCommit = $true
} catch {
    $hasCommit = $false
}

if (-not $hasCommit) {
    Write-Output "No commits found; creating an initial empty commit..."
    git commit --allow-empty -m "Initial commit"
} else {
    Write-Output "Repository has commits."
}

# Attempt push, and if it fails because remote has commits, try fetch+rebase then push
Write-Output "Attempting to push to origin main..."
$pushSucceeded = $false
try {
    git push -u origin main
    $pushSucceeded = $true
} catch {
    Write-Warning "Initial push failed: $($_.Exception.Message)"

    # Check if remote has main branch
    $remoteHasMain = $false
    try {
        git ls-remote --exit-code --heads origin main > $null 2>&1
        $remoteHasMain = $true
    } catch {
        $remoteHasMain = $false
    }

    if ($remoteHasMain) {
        Write-Output "Remote branch 'origin/main' exists. Fetching and attempting rebase..."
        try {
            git fetch origin
            git pull --rebase origin main
            Write-Output "Rebase successful, pushing again..."
            git push -u origin main
            $pushSucceeded = $true
        } catch {
            Write-Error "Automatic rebase failed. Please resolve conflicts locally and run 'git push' when ready."
            exit 1
        }
    } else {
        Write-Output "Remote has no 'main' branch; retrying push with --set-upstream..."
        try {
            git push -u origin main
            $pushSucceeded = $true
        } catch {
            Write-Error "Push failed even after retries: $($_.Exception.Message)"
            exit 1
        }
    }
}

if ($pushSucceeded) {
    Write-Output "Push successful. Verify the repo at: $remoteUrl"
}
