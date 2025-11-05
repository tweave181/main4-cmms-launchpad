# GitHub Actions Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### 🧪 test.yml - Test Suite
**Triggers:** Push to main/develop, Pull requests to main/develop

**Jobs:**
- **test**: Runs tests on Node.js 18.x and 20.x
  - Type checking
  - Unit tests
  - Coverage reporting
  - Codecov integration
- **lint**: ESLint checks
- **build**: Build verification and size check
- **status-check**: Overall status aggregation

**Required Secrets:**
- `CODECOV_TOKEN` (optional) - For coverage reporting to Codecov
- `GITHUB_TOKEN` (auto-provided) - For PR comments

### 🔍 pr-checks.yml - PR Quality Checks
**Triggers:** Pull requests (opened, synchronize, reopened)

**Jobs:**
- **pr-validation**: 
  - Type error checking
  - Tests for changed files
  - Bundle size impact analysis
- **security-scan**:
  - npm audit
  - Dependency vulnerability checks
- **code-quality**:
  - Code formatting checks
  - SonarCloud analysis (if configured)

**Optional Secrets:**
- `SONAR_TOKEN` - For SonarCloud integration

## Setup Instructions

### 1. Basic Setup (No additional setup required)
The workflows will run automatically on push and PR events. The `GITHUB_TOKEN` is automatically provided.

### 2. Enable Coverage Reporting (Optional)
1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Copy the upload token
4. Add `CODECOV_TOKEN` to your repository secrets:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token

### 3. Enable Code Quality Analysis (Optional)
1. Sign up at [sonarcloud.io](https://sonarcloud.io)
2. Import your repository
3. Copy the token and project key
4. Add `SONAR_TOKEN` to repository secrets
5. Update `sonar.projectKey` and `sonar.organization` in `pr-checks.yml`

## Status Badges

Add these badges to your README.md:

```markdown
![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Test%20Suite/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/PR%20Quality%20Checks/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

## Local Testing

Before pushing, test your changes locally:

```bash
# Run all tests
npm run test

# Run tests in CI mode
npm run test:run

# Generate coverage
npm run test:coverage

# Type check
npm run build

# Lint
npx eslint . --ext .ts,.tsx
```

## Workflow Configuration

### Node Version Matrix
Tests run on multiple Node.js versions to ensure compatibility:
- Node.js 18.x (LTS)
- Node.js 20.x (Latest LTS)

To modify versions, edit the `matrix.node-version` in `test.yml`.

### Test Coverage Threshold
To enforce minimum coverage, add to `vitest.config.ts`:

```typescript
test: {
  coverage: {
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
}
```

### Skip CI
Add `[skip ci]` or `[ci skip]` to your commit message to skip workflow runs:

```bash
git commit -m "docs: Update README [skip ci]"
```

## Troubleshooting

### Tests Failing in CI but Passing Locally
- Ensure environment variables are set correctly
- Check Node.js version compatibility
- Verify all dependencies are in package.json (not just local node_modules)

### Coverage Upload Fails
- Verify `CODECOV_TOKEN` is set correctly
- Check that coverage files are generated (`./coverage/` directory)
- Review Codecov logs in the workflow run

### Build Times Too Long
- Enable dependency caching (already configured)
- Consider splitting jobs or running in parallel
- Review and optimize test suites

## Best Practices

1. **Keep workflows fast**: Target < 5 minutes per workflow
2. **Use caching**: Dependencies are cached automatically
3. **Fail fast**: Set `continue-on-error: false` for critical checks
4. **Monitor status**: Use GitHub's checks API for PR status
5. **Regular maintenance**: Update action versions quarterly

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Documentation](https://vitest.dev/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Action Marketplace](https://github.com/marketplace?type=actions)
