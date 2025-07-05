# BetHub Development Workflow

## 🎯 **Development Philosophy**

**Lean but Structured**: We maintain a lean approach while ensuring code quality and proper version control. Main branch is always production-ready.

## 🌿 **Branching Strategy**

### **Main Branch (`main`)**
- **Always production-ready**
- **Deploys automatically to Vercel**
- **Requires testing before merge** (pipeline coming later)
- **No direct commits** - only merges from feature branches

### **Feature Branches**
- **Format**: `feature/description-of-feature`
- **Examples**:
  - `feature/football-api-integration`
  - `feature/enhanced-match-cards`
  - `feature/admin-sync-panel`

### **Enhancement Branches**
- **Format**: `enhancement/description-of-improvement`
- **Examples**:
  - `enhancement/improve-loading-states`
  - `enhancement/better-error-handling`
  - `enhancement/optimize-performance`

### **Bugfix Branches**
- **Format**: `bugfix/description-of-fix`
- **Examples**:
  - `bugfix/fix-auth-modal-close`
  - `bugfix/resolve-match-card-layout`
  - `bugfix/fix-admin-permissions`

## 📝 **Commit Convention**

### **Format**
```
[type]- description

[optional body]

[optional footer]
```

### **Types**
- `[feature]` - New functionality
- `[enhancement]` - Improvements to existing features
- `[bugfix]` - Bug fixes
- `[refactor]` - Code refactoring
- `[docs]` - Documentation changes
- `[style]` - Code style changes (formatting, etc.)
- `[test]` - Adding or updating tests
- `[chore]` - Maintenance tasks

### **Examples**
```
[feature]- add football API integration

[enhancement]- improve match card loading states

[bugfix]- fix auth modal not closing properly

[refactor]- restructure API service classes

[docs]- update README with new features

[style]- format code with prettier

[test]- add auth system tests

[chore]- update dependencies
```

## 🔄 **Development Process**

### **1. Starting Work**
```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or enhancement branch
git checkout -b enhancement/your-improvement

# Or bugfix branch
git checkout -b bugfix/your-fix
```

### **2. Development**
```bash
# Make your changes
# Test locally
npm run dev
npm test

# Commit with proper convention
git add .
git commit -m "[feature]- add new match analysis component"
```

### **3. Before Pushing**
```bash
# Ensure tests pass
npm test

# Check for linting issues
npm run lint

# Update main if needed
git checkout main
git pull origin main
git checkout your-branch
git rebase main
```

### **4. Push and Create PR**
```bash
git push origin your-branch

# Create Pull Request on GitHub
# Title: [feature]- add new match analysis component
# Description: Detailed description of changes
```

### **5. Review and Merge**
- **Self-review**: Check your own code
- **Test locally**: Ensure everything works
- **Merge to main**: Only when confident it's production-ready

## 🚀 **Deployment Process**

### **Current (Lean)**
- **Automatic**: Vercel deploys on push to main
- **Manual testing**: Test in production after deployment
- **Quick rollback**: Revert commit if issues found

### **Future (With Pipeline)**
- **Automated testing**: GitHub Actions run tests
- **Preview deployments**: Vercel preview for PRs
- **Staging environment**: Test before production
- **Automated quality checks**: Linting, type checking, etc.

## 📋 **Quality Checklist**

### **Before Committing**
- [ ] Code follows project conventions
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Loading states added where needed
- [ ] Mobile responsiveness checked

### **Before Pushing**
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] No TypeScript errors
- [ ] Feature works as expected
- [ ] No breaking changes (unless intentional)

### **Before Merging to Main**
- [ ] Self-review completed
- [ ] Feature tested thoroughly
- [ ] No obvious bugs
- [ ] Performance impact considered
- [ ] Documentation updated if needed

## 🎯 **Immediate Improvements Strategy**

### **Week 1: Foundation**
1. **Set up proper branching** (this week)
2. **Establish commit conventions** (this week)
3. **Create feature branch for next improvement**

### **Week 2: First Features**
1. **Football API integration** (`feature/football-api`)
2. **Enhanced match cards** (`enhancement/match-cards`)

### **Week 3: Polish**
1. **Better error handling** (`enhancement/error-handling`)
2. **Performance improvements** (`enhancement/performance`)

## 🔧 **Git Commands Reference**

### **Branch Management**
```bash
# List all branches
git branch -a

# Switch to branch
git checkout branch-name

# Create and switch to new branch
git checkout -b feature/new-feature

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

### **Commit Management**
```bash
# Stage all changes
git add .

# Stage specific files
git add src/components/NewComponent.tsx

# Commit with message
git commit -m "[feature]- add new component"

# Amend last commit
git commit --amend -m "[feature]- add new component with fixes"

# View commit history
git log --oneline -10
```

### **Sync with Main**
```bash
# Update main
git checkout main
git pull origin main

# Rebase your branch on main
git checkout your-branch
git rebase main

# Or merge main into your branch
git checkout your-branch
git merge main
```

## 🚨 **Emergency Procedures**

### **Hotfix Process**
```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# Fix the issue
# Commit with [bugfix]- prefix
git commit -m "[bugfix]- fix critical authentication issue"

# Push and merge immediately
git push origin hotfix/critical-bug
# Merge to main immediately
```

### **Rollback Process**
```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert commit-hash

# Push revert
git push origin main
```

## 📊 **Progress Tracking**

### **Current Sprint Goals**
- [ ] Establish development workflow
- [ ] Implement football API integration
- [ ] Enhance match display
- [ ] Improve user experience

### **Success Metrics**
- **Deployment frequency**: Daily to weekly
- **Bug rate**: < 5% of deployments
- **Feature completion**: 80% of planned features
- **Code quality**: No linting errors in main

This workflow ensures we maintain quality while staying lean and moving fast. Each improvement builds on the previous, creating a solid foundation for growth. 