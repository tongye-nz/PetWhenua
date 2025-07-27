# 🚀 CI/CD Setup - Automated Testing

This document explains the CI/CD (Continuous Integration/Continuous Deployment) setup for the PetWhenua project, which automatically runs tests whenever code is pushed or pull requests are created.

## 📋 Overview

We have implemented a comprehensive CI/CD pipeline that includes:

- **Backend Tests** (.NET Core with xUnit)
- **Frontend Tests** (React with Vitest)
- **Integration Tests** (Full stack testing)
- **Code Coverage** (Automated reports)
- **Build Validation** (Ensure code compiles)
- **Linting & Type Checking** (Code quality)

## 🔄 Workflows

### 1. Main CI Tests (`ci-tests.yml`)

**Triggers:**
- Push to `main`, `develop`, or `add_unit_test` branches
- Pull requests to `main` or `develop`

**What it does:**
- ✅ Runs all backend tests (249 tests currently)
- ✅ Runs all frontend tests with coverage
- ✅ Builds both backend and frontend
- ✅ Runs integration tests with SQL Server
- ✅ Generates code coverage reports
- ✅ Uploads test artifacts

**Jobs:**
1. **Backend Tests** - Runs .NET tests with coverage
2. **Frontend Tests** - Runs React/Vitest tests with linting
3. **Integration Tests** - End-to-end testing with database
4. **Test Summary** - Generates comprehensive report

### 2. PR Validation (`pr-validation.yml`)

**Triggers:**
- Pull requests opened, updated, or ready for review

**What it does:**
- ⚡ Quick validation (faster feedback)
- ✅ Basic build validation
- ✅ Critical tests only
- ✅ Linting and TypeScript checks
- ✅ Changed files analysis

**Benefits:**
- Faster feedback (2-3 minutes vs 8-10 minutes)
- Identifies issues early
- Shows what files were changed
- Skips for draft PRs

## 🧪 Test Structure

### Backend Tests (.NET)
```
PetWhenua.Tests/
├── Controllers/
│   ├── PostsControllerTests.cs      # 38 tests
│   ├── AdminControllerSimpleTests.cs
│   ├── PostPermissionsControllerTests.cs
│   ├── MeetupControllerTests.cs
│   └── AuthControllerTests.cs
├── Services/
│   ├── PostAuthorizationServiceTests.cs
│   ├── AuthServiceTests.cs
│   └── PetServiceTests.cs
└── Repositories/
    └── UserRepositoryTests.cs
```

**Current Coverage:**
- **249 total tests**
- **Controllers:** Post operations, Authentication, Admin functions
- **Services:** Authorization, Business logic
- **Repositories:** Data access patterns

### Frontend Tests (React/Vitest)
```
react-app/src/test/
├── components/
│   └── ui/           # UI component tests
└── utils/           # Utility function tests
```

**Test Commands:**
- `npm test` - Run tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - With coverage
- `npm run test:ui` - Interactive UI

## 📊 Code Coverage

Code coverage reports are automatically generated and uploaded to:

1. **Codecov** - Public coverage dashboards
2. **GitHub Artifacts** - Downloadable reports
3. **PR Comments** - Coverage changes in PRs

**Coverage Targets:**
- Backend: Aim for >80% code coverage
- Frontend: Aim for >70% code coverage
- Critical paths: 100% coverage required

## 🔧 Local Development

### Running Tests Locally

**Backend:**
```bash
# All tests
dotnet test

# Specific category
dotnet test --filter "Category=Post"

# With coverage
dotnet test --collect:"XPlat Code Coverage"
```

**Frontend:**
```bash
cd react-app

# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Before Pushing Code

1. **Run tests locally:**
   ```bash
   dotnet test
   cd react-app && npm test
   ```

2. **Check linting:**
   ```bash
   cd react-app && npm run lint
   ```

3. **Build to verify:**
   ```bash
   dotnet build
   cd react-app && npm run build
   ```

## 🚨 Troubleshooting

### Common Issues

**1. Tests failing in CI but passing locally:**
- Check for timezone differences
- Verify environment variables
- Look at test isolation issues

**2. Build failures:**
- Check for missing dependencies
- Verify .NET/Node.js version compatibility
- Check for case-sensitive file paths

**3. Integration test failures:**
- Database connection issues
- Test data conflicts
- Service startup problems

### Getting Help

1. **Check the workflow logs** in GitHub Actions
2. **Download test artifacts** for detailed reports
3. **Look at the test summary** in PR comments
4. **Run tests locally** to reproduce issues

## 📈 Metrics & Monitoring

### What we track:
- ✅ Test pass/fail rates
- 📊 Code coverage trends
- ⏱️ Build duration
- 🔄 Deployment frequency
- 🐛 Defect escape rate

### Success Criteria:
- All tests must pass before merging
- Coverage should not decrease
- Build time should be < 10 minutes
- Zero critical vulnerabilities

## 🎯 Best Practices

### For Developers:

1. **Write tests first** (TDD approach)
2. **Keep tests fast** and isolated
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test edge cases and error conditions**

### For Pull Requests:

1. **Include tests** for new features
2. **Update tests** for modified code
3. **Check coverage reports**
4. **Ensure CI passes** before requesting review
5. **Document test scenarios** in PR description

### Test Categories:

- `Priority=High` - Critical functionality
- `Category=Integration` - Full-stack tests
- `Category=Post` - Post-related features
- `Category=Auth` - Authentication tests

## 🔮 Future Enhancements

- **Performance testing** integration
- **Security scanning** automation
- **Deployment automation** to staging
- **End-to-end testing** with Playwright
- **Database migration testing**
- **Load testing** for APIs

## 📞 Support

For CI/CD issues or questions:
1. Check this documentation
2. Review GitHub Actions logs
3. Ask in the team chat
4. Create an issue with the `ci/cd` label

---

**Remember:** The CI/CD pipeline is here to help maintain code quality and catch issues early. Embrace it as a safety net, not a hurdle! 🛡️ 