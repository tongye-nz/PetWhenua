# 🛡️ Branch Protection Rules Setup

To ensure code quality and enforce CI/CD checks, set up branch protection rules for your main branches.

## 🔒 Recommended Branch Protection Rules

### For `main` branch:

1. **Go to Settings → Branches in your GitHub repository**
2. **Click "Add rule" for the `main` branch**
3. **Configure the following settings:**

#### Required Settings:
- ✅ **Require a pull request before merging**
  - Require approvals: `1`
  - Dismiss stale reviews when new commits are pushed
  - Require review from code owners

- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - **Required status checks:**
    - `Backend Tests (.NET)` 
    - `Frontend Tests (React/Vitest)`
    - `Quick Validation`
    - `Integration Tests`

- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits** (optional but recommended)

- ✅ **Require linear history** (optional - prevents merge commits)

#### Admin Settings:
- ✅ **Include administrators** (applies rules to admins too)
- ❌ **Allow force pushes** (disabled for safety)
- ❌ **Allow deletions** (disabled for safety)

### For `develop` branch:

Same settings as `main` but with these differences:
- Require approvals: `1` (can be reduced to 0 for faster development)
- May allow force pushes for development workflow

## 🚦 Status Check Requirements

The following CI checks must pass before merging:

### From `ci-tests.yml`:
- **Backend Tests (.NET)** - All backend tests must pass
- **Frontend Tests (React/Vitest)** - All frontend tests must pass  
- **Integration Tests** - Full-stack integration tests must pass

### From `pr-validation.yml`:
- **Quick Validation** - Basic build and critical tests must pass

## 🔧 Setting Up via GitHub CLI (Optional)

```bash
# Install GitHub CLI if not already installed
# Then run these commands:

# Protect main branch
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Backend Tests (.NET)","Frontend Tests (React/Vitest)","Quick Validation","Integration Tests"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# Protect develop branch  
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Backend Tests (.NET)","Frontend Tests (React/Vitest)","Quick Validation"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

## 📋 Verification Checklist

After setting up branch protection:

- [ ] Try creating a PR that fails tests → Should be blocked from merging
- [ ] Try creating a PR that passes tests → Should be allowed to merge
- [ ] Verify admin users cannot bypass rules (if enabled)
- [ ] Test force push protection (should be blocked)
- [ ] Verify status checks appear in PR interface

## 🚨 Emergency Procedures

### Bypassing Protection (Emergency Only):

1. **Temporarily disable branch protection**
2. **Make emergency changes**
3. **Re-enable protection immediately**
4. **Create follow-up PR to add proper tests**

### Hotfix Process:

1. **Create hotfix branch from main**
2. **Make minimal changes**
3. **Create PR with expedited review**
4. **Ensure all CI checks pass**
5. **Merge and deploy**

## 📞 Troubleshooting

### Common Issues:

**Status checks not appearing:**
- Check workflow names match exactly
- Ensure workflows have run at least once
- Verify branch name in workflow triggers

**Rules not enforcing:**
- Check admin override settings
- Verify user permissions
- Ensure rules are saved correctly

**CI checks failing:**
- Review the CI/CD Setup documentation
- Check workflow logs in Actions tab
- Run tests locally to debug

---

**Note:** Branch protection rules are crucial for maintaining code quality and preventing broken code from reaching production. Set them up as soon as possible! 🛡️ 