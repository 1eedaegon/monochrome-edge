# Contributing to Monochrome Edge

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning.

### Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types & Version Impact

| Type | Version Bump | Description | Example |
|------|-------------|-------------|----------|
| `feat` | Minor (0.X.0) | New feature | `feat: add Vue support` |
| `fix` | Patch (0.0.X) | Bug fix | `fix: correct button hover state` |
| `docs` | Patch | Documentation only | `docs: update README` |
| `style` | Patch | Code style (formatting) | `style: fix indentation` |
| `refactor` | Patch | Code refactoring | `refactor: simplify theme logic` |
| `perf` | Patch | Performance improvement | `perf: optimize CSS bundle` |
| `test` | Patch | Add/fix tests | `test: add Button tests` |
| `chore` | Patch | Maintenance | `chore: update dependencies` |
| `build` | Patch | Build system | `build: update rollup config` |
| `ci` | Patch | CI/CD changes | `ci: add release workflow` |

### Breaking Changes → Major (X.0.0)
```
feat!: redesign theme API
fix!: change button prop names
feat(button): update API

BREAKING CHANGE: onClick is now onPress
```

### Examples

#### Patch Release (0.0.X)
```
fix: correct dark mode colors
docs: add Vue examples
chore: update dependencies
```

#### Minor Release (0.X.0)
```
feat: add tooltip component
feat(theme): add purple variant
```

#### Major Release (X.0.0)
```
feat!: migrate to CSS modules
fix!: remove deprecated props

feat: new theme system

BREAKING CHANGE: data-theme is now data-theme-variant
```

## Automated Release Process

1. **Create PR** with conventional commits
2. **CI checks** commit messages
3. **Auto-labels** PR with version impact (patch/minor/major)
4. **Merge to main** triggers release
5. **Auto-version** based on commits
6. **Auto-publish** to npm
7. **Auto-changelog** in GitHub Release

## Local Development

```bash
# Install
npm install

# Build
npm run build

# Test changes
npm run dev
```

## PR Guidelines

1. Use conventional commits
2. Keep PRs focused (one feature/fix)
3. Update tests if needed
4. Check CI passes
5. Version will auto-increment on merge