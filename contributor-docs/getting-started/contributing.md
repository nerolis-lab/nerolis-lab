# Contributing to Neroli's Lab

Thank you for considering contributing to Neroli's Lab! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or helping with community support.

## 🤝 How to Contribute

### Types of Contributions

- **💻 Code Contributions**: Submit bug fixes, features, or optimizations
- **🎨 Design**: UI/UX improvements and user experience enhancements
- **📚 Documentation**: Improve guides, API docs, or code comments
- **✨ Feature Requests**: Suggest new features or improvements
- **🐛 Bug Reports**: Help us identify and fix issues
- **🧪 Testing**: Write tests or help with quality assurance

## 📝 Contribution Workflow

### 1. Issue First

For significant changes:

- **Discuss the approach** with maintainers before starting
- **[Create an issue](https://feedback.nerolislab.com/)** describing the feature or bug
- **Check existing issues** to avoid duplication

For small fixes (typos, small bugs), you can directly create a pull request.

### 2. Follow existing code conventions

While we're always open to improvement suggestions and welcome these discussions, please adhere to existing/negotiated conventions during development.

### 3. Always test your code changes

There are over 2000 examples in our codebase to look at and a very welcoming [Discord](https://discord.gg/SP9Ms69ueD) server. Please write tests for your code changes.

Example test structure:

```typescript
import { describe, it, expect } from 'vitest';
import { SNEASEL } from './berry-pokemon';

describe('SNEASEL', () => {
  it('should confirm that Sneasel is the best Pokémon', () => {
    const result = SNEASEL.isBestPokemon();
    expect(result).toBe(true);
  });
});
```

Also please ensure all tests pass before submitting:

```bash
# Lints the entire repository, usually not needed if you have the workspace properly set up
npm run lint

# Component-specific tests
cd common && npm run test
cd backend && npm run test
cd frontend && npm run test
```

#### 4. Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat(frontend): add ingredient calculator widget"

# Bug fix
git commit -m "fix(backend): resolve authentication timeout issue"

# Documentation
git commit -m "docs: update API documentation for team endpoints"

# Breaking change
git commit -m "feat(api)!: change team calculation response format"
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 5. Pull Request

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**

   - Use a descriptive title
   - Add screenshots for UI changes
   - **Rebase to develop branch** before submitting (see [Linear History & Rebasing](./linear-history) guide)

## 🏗️ Component-Specific Guidelines

For detailed development guidelines specific to each component, please refer to their respective documentation:

- **[Frontend Guidelines](../components/frontend.md#development-guidelines)** - Vue.js, Vuetify, and frontend-specific practices
- **[Backend Guidelines](../components/backend.md#development-guidelines)** - Node.js, API design, and backend-specific practices
- **[Common Library Guidelines](../components/common.md#development-guidelines)** - Shared library development practices

## 📋 Code Review Process

### What We Look For

- **Functionality**: Does it work as intended?
- **Code Quality**: Is it readable and maintainable?
- **Testing**: Are there appropriate tests?
- **Documentation**: Is it properly documented?
- **Performance**: Does it impact performance?
- **Security**: Are there any security concerns?

## 💬 Community

Join our [Discord](https://discord.gg/SP9Ms69ueD) community for support and discussions, we can also help you select issues to work on

## 🎉 Recognition

Contributors are recognized in:

- **Announcements**: Significant contributions are generally released with credit in the announcements
- **Discord**: Frequent contributors have the possiblity of being promoted to the extended development team

### Community Guidelines

- **Be Respectful**: Treat everyone with respect
- **Be Constructive**: Provide helpful feedback
- **Be Patient**: Maintainers are volunteers
- **Follow Code of Conduct**: See [CODE_OF_CONDUCT.md](https://github.com/nerolis-lab/nerolis-lab/blob/main/CODE_OF_CONDUCT.md)

## Next Steps

1. Check the [Development Setup](./development-setup) for development workflows
2. Join our [Discord](https://discord.gg/SP9Ms69ueD) community for support and discussions, we can also help you select issues to work on
3. Pick an issue from either [our feedback website](https://feedback.nerolislab.com/) or [GitHub](https://github.com/nerolis-lab/nerolis-lab/issues) to start contributing

Thank you for helping make Neroli's Lab better! 🌟
