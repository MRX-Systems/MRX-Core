# GitHub Workflows Documentation

This directory contains cleaned and optimized GitHub Actions workflows following DRY (Don't Repeat Yourself) principles.

## Structure

### Main Workflows
- `main-ci.yml` - Continuous Integration workflow for pull requests
- `main-deploy.yml` - Deployment workflow for main branch

### Job Workflows (Reusable)
- `job-build.yml` - Build the project
- `job-lint.yml` - Lint code and auto-fix issues
- `job-unit-test.yml` - Run unit tests
- `job-integration-test.yml` - Run integration tests
- `job-create-github-release.yml` - Create GitHub releases
- `job-publish-npm.yml` - Publish to NPM registry
- `job-rebase.yml` - Rebase branches

### Utility Workflows
- `copilot-setup-steps.yml` - Setup steps for GitHub Copilot

## Composite Actions

Located in `.github/actions/`, these reusable actions eliminate code duplication:

### `setup/action.yml`
Handles common project setup:
- Checkout repository
- Setup Bun (configurable version)
- Install dependencies (optional)

**Usage:**
```yaml
- name: Setup Project Environment
  uses: ./.github/actions/setup
  with:
    branch: ${{ github.ref_name }}
    ssh-key: ${{ secrets.KEY_SSH }}
    bun-version: "1.2.23"
```

### `git-config/action.yml`
Configures Git with GPG signing:
- Import GPG private key
- Configure Git user and signing settings

**Usage:**
```yaml
- name: Configure Git with GPG
  uses: ./.github/actions/git-config
  with:
    gpg-key: ${{ secrets.KEY_GPG }}
    git-email: ${{ secrets.GIT_EMAIL }}
```

## Environment Variables

All workflows use standardized environment variables:
- `BUN_VERSION: 1.2.23` - Consistent Bun version across all jobs

## Improvements Made

1. **Reduced Code Duplication**: Created reusable composite actions
2. **Standardized Versions**: Consistent Bun version (1.2.23) across all workflows
3. **Improved Secret Verification**: Simplified validation using loops
4. **Better Structure**: Consistent formatting and organization
5. **Enhanced Maintainability**: Centralized common operations

## Benefits

- **Easier Updates**: Change Bun version in one place
- **Reduced Maintenance**: Fix bugs in composite actions once, apply everywhere
- **Consistency**: All workflows follow same patterns
- **Cleaner Code**: Eliminated ~60 lines of duplicate code