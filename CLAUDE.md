# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Neroli's Lab (SleepAPI) is a full-stack Pokémon Sleep application with three packages:

- **backend**: Express API (Bun dev, Node.js production)
- **frontend**: Vue 3 SPA with Vuetify 3
- **common**: Shared TypeScript library

## Essential Commands

### Development

```bash
# Start development servers
cd backend && npm run dev        # Backend with Bun hot reload
cd frontend && npm run dev       # Frontend with Vite

# Build common library (build first when changing shared types)
cd common && npm run build
cd common && npm run build-watch # Watch mode for development
```

### Testing & Quality

```bash
# Run tests
npm run test                     # All tests in package
npm run test -- testname.test.ts # Specific test file
npx vitest --run -- testname.test.ts # Direct vitest execution

# Code quality (REQUIRED after changes)
npx eslint .                     # Lint current directory
npm run type-check               # Frontend type checking (in frontend/)
npm run compile                  # Backend type checking (in backend/)
```

## Architecture Quick Reference

### File Structure

- **Backend**: `controllers/` → `services/` → `daos/` → database
- **Frontend**: `pages/` (routes) → `components/` → `stores/` (Pinia)
- **Common**: Shared types and utilities

### Key Patterns

- Controllers use TSOA decorators (minimal, non-sensitive routes only)
- DAOs extend AbstractDAO with repository pattern
- Vue components follow atomic design
- API clients in `frontend/src/services/` match backend endpoints

## Required Workflows

### Code Changes Checklist

1. **Write/update tests** for any functionality changes
2. **Run tests** to verify: `npx vitest --run -- testname.test.ts`
3. **Lint changed files**: `npx eslint .`
4. **Type check**: `npm run type-check` (frontend) or `npm run compile` (backend)
5. **Build common** if shared types changed: `cd common && npm run build`

### Testing Patterns

**Vue Component Tests (required structure):**

```typescript
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import MyComponent from './my-component.vue';

describe('MyComponent', () => {
  let wrapper: VueWrapper<InstanceType<typeof MyComponent>>;

  beforeEach(() => {
    wrapper = mount(MyComponent, {
      props: { someProp: 'value' }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
```

**Mocking Strategy:**

- Only mock external dependencies (APIs, HTTP requests, browser features)
- Don't mock utility functions or internal services
- **Use mock factories from `{package}/src/vitest/mocks/`** instead of hard-coded inline mocks
- Avoid `as any` casts - complex interfaces have proper mock factory methods
- Each package has its own mocks directory that extends common mocks

### Frontend Design Work

- Use Playwright MCP with screenshots for self-feedback loops
- Follow TDD approach for feature development
- Prefer utility classes from `frontend/src/assets/common.scss` over Vuetify utilities

## Environment & Setup

### Environment Files

- Frontend: `.env` (copy from `.env.example`)
- Backend: `.env` (copy from `.env.example`, set `DATABASE_MIGRATION=UP`)

### Database

```bash
docker-compose up -d             # Start MySQL
# Migrations run automatically on backend start
```

### Package Installation

```bash
npm install                      # Root (git hooks)
cd backend && bun install        # Backend dependencies
cd frontend && npm install       # Frontend dependencies
cd common && npm install         # Common dependencies
```

## Commit Guidelines

Follow conventional commits (enforced by commitlint):

- `feat:` new features
- `fix:` bug fixes
- `style:` design/UI changes
- `chore:` maintenance
- `refactor:` code restructuring
- `test:` test changes
- `perf:` performance improvements

**Rules:**

- Header ≤72 characters
- No sentence case (avoid capitals unless proper nouns)
- No period at end
- No Claude Code references in commit messages

## Key Technologies

- **Backend**: Express 5, TypeScript, Knex, MySQL, TSOA
- **Frontend**: Vue 3, Vuetify 3, Pinia, Vite, Chart.js
- **Testing**: Vitest across all packages
- **Runtime**: Bun (dev), Node.js (production)

## Common Tasks

### Adding API Endpoint

1. Controller in `backend/src/controllers/`
2. Service in `backend/src/services/`
3. Types in `common/src/types/`
4. Build common package
5. API client in `frontend/src/services/`

### Database Changes

1. Migration in `backend/src/database/migration/migrations/`
2. Update types in `common/src/types/`
3. Update DAOs

### CSS Styling

- Use utility classes from `frontend/src/assets/common.scss`
- Common flex classes: `.flex-center`, `.flex-between`, `.flex-column`
- Responsive text classes available
- Prefer utility classes over Vuetify utilities or custom CSS
- **Never use inline styles** - always use CSS classes or scoped styles

## Code Comments Guidelines

- Only use code comments if vital for explaining the code block
- Avoid unnecessary comments that do not add meaningful context or explanation

## Best Practices

- Never use inline styles
- Never use any as a type unless working with generics
