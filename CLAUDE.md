# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SleepAPI (Neroli's Lab) is a full-stack web application for Pokémon Sleep that provides production calculators, team composition algorithms, and simulation-based cooking tier lists. It's structured as a monorepo with three main packages: backend (Express API), frontend (Vue SPA), and common (shared TypeScript library).

## Essential Commands

### Initial Setup

```bash
# Clone and install dependencies
npm install          # Root dependencies and git hooks
cd backend && bun install
cd ../frontend && npm install
cd ../common && npm install

# Database setup
docker-compose up -d  # Start MySQL container
Migrations run automatically if DATABASE_MIGRATION="UP" is set in .env in backend
```

### Development Commands

**Backend Development:**

```bash
cd backend
npm run dev               # Alternative dev server
npm run test              # Run tests with coverage
npm run test-watch        # Tests in watch mode
npm run compile           # Type-check only
npm run build             # Build for production
```

**Frontend Development:**

```bash
cd frontend
npm run dev               # Start Vite dev server
npm run test              # Run tests with coverage
npm run test-watch        # Tests in watch mode
npm run type-check        # Vue type checking
npm run build             # Build for production
```

**Common Library:**

```bash
cd common
npm run build             # Build the library
npm run build-watch       # Build in watch mode (use when developing)
npm run test              # Run tests
```

### Code Quality

```bash
# From root directory
npm run lint              # Run ESLint and Prettier checks
npm run lint-fix          # Auto-fix linting issues
```

### Testing Single Files

```bash
# Vitest supports pattern matching
npm run test -- path/to/file.test.ts
npm run test -- --grep "specific test name"
```

## Architecture Overview

### Backend Structure

- **Controllers**: HTTP request handlers following TSOA decorators for OpenAPI generation. Only add OpenAPI decorators for trivial non-sensitive routes.
- **Services**: Business logic layer with dependency injection pattern
- **DAOs**: Data Access Objects for database operations, extending AbstractDAO
- **Routes**: Express route definitions that bind controllers
- **Domain**: Custom error classes and domain models
- **Database**: Knex migrations and MySQL queries

Key patterns:

- Repository pattern with abstract DAO base class
- Worker pool for CPU-intensive calculations (simulations)
- OAuth2 authentication with Discord/Google/Patreon
- JWT session management
- Request validation using TypeBox schemas

### Frontend Structure

- **Pages**: Route-level components
- **Components**: Reusable Vue components following atomic design
- **Stores**: Pinia stores with persisted state
- **Services**: API client services matching backend endpoints
- **Composables**: Shared Vue composition functions

Key patterns:

- Service layer for API communication
- Vuetify 3 for Material Design components
- Chart.js for data visualization
- PWA configuration for offline support

### Common Package

Shared TypeScript types and utilities used by both frontend and backend. Build this first when making changes to shared types.

## Important Development Notes

1. **Build Order**: Always build `common` before working on frontend/backend if you've modified shared types

2. **Environment Variables**: Copy `.env.example` files and configure OAuth credentials and database settings

3. **Database Migrations**:

   - Create new migrations in `backend/src/database/migration/migrations/`
   - Use sequential numbering (e.g., `012_add_feature.js`)
   - Runs automatically when backend starts, if `.env DATABASE_MIGRATION=up`

4. **API Documentation**: Available at `http://localhost:3000/docs` when backend is running

5. **Testing**: All packages use Vitest. Tests are colocated with source files as `.test.ts`

6. **Type Safety**: The project uses strict TypeScript. Run type checking before committing

7. **Commits**: Follow conventional commits format (enforced by commitlint):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `chore:` for maintenance
   - `docs:` for documentation

## Key Technologies

- **Runtime**: Bun (backend dev), Node.js (production)
- **Backend**: Express 5, TypeScript, Knex, MySQL, TSOA
- **Frontend**: Vue 3, Vuetify 3, Pinia, Vite, TypeScript
- **Testing**: Vitest across all packages
- **Build Tools**: TSC (backend), Vite (frontend), Rollup (common)

## Common Tasks

### Adding a New API Endpoint

1. Create controller method with TSOA decorators in `backend/src/controllers/`
2. Add service logic in `backend/src/services/`
3. Create DAO methods if database access needed
4. Add corresponding types in `common/src/types/`
5. Build common package
6. Add API client method in `frontend/src/services/`
7. Update frontend components/stores to use new endpoint

### Running Simulations

The backend uses worker threads for Monte Carlo simulations. See `backend/src/services/calculator/team-simulator.ts` for the implementation.

### Database Schema Changes

1. Create migration file in `backend/src/database/migration/migrations/`
2. Update TypeScript types in `common/src/types/`
3. Update DAOs to handle new fields
4. Run migration: `cd backend && npm run migrate`

## Performance Considerations

- Worker threads are used for CPU-intensive calculations
- Database queries should use appropriate indexes
- Frontend uses lazy loading for routes
- Images are optimized with multiple formats (webp, png)

## Development Workflow Requirements

### Code Quality Enforcement

**ALWAYS run these commands after making code changes:**

```bash
# Linting (run from root or specific package directory)
npx eslint .                    # Lint current directory
npm run lint                    # Project-wide linting
npm run lint-fix                # Auto-fix linting issues

# Compilation verification
cd backend && npm run build     # Build backend
cd backend && bun compile       # Additional backend type checking
cd frontend && npm run build    # Build frontend
cd common && npm run build      # Build common library

# Type checking
cd frontend && npm run type-check  # Vue-specific type checking
cd backend && npm run compile      # Backend type checking
```

### Testing Requirements

**ALL code changes must include tests:**

1. **Write or update tests** for any new functionality or bug fixes
2. **Run tests to verify they work**:

   ```bash
   # Run all tests in a package
   npm run test

   # Run specific test file
   npm run test -- testname.test.ts

   # Run specific test file with Vitest directly
   npx vitest --run -- testname.test.ts
   ```

3. **Verify test coverage** remains adequate
4. **Fix any failing tests** before considering changes complete

### Test Structure and Patterns

#### Frontend Vue Component Testing

**Required patterns for Vue component tests:**

```typescript
import { useTeamStore } from '@/stores/team/team-store';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import MyComponent from './my-component.vue';

describe('MyComponent', () => {
  let wrapper: VueWrapper<InstanceType<typeof MyComponent>>;
  let teamStore: ReturnType<typeof useTeamStore>;

  beforeEach(() => {
    teamStore = useTeamStore();

    // Setup mock data
    const mockData = createMockData();
    teamStore.someProperty = mockData;

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

**Critical rules:**

- Always declare wrapper as `let wrapper: VueWrapper<InstanceType<typeof ComponentName>>`
- Use `let storeName: ReturnType<typeof useStoreName>` for Pinia stores
- Include `beforeEach` for component mounting and store initialization
- Always include `afterEach(() => { wrapper.unmount() })` for cleanup
- Reassign stores in beforeEach using `storeName = useStoreName()`

#### Minimal Mocking Strategy

**Only mock external dependencies that don't work in test environments:**

```typescript
// ✅ DO Mock: External APIs, HTTP requests, browser-specific features
vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn(() => ({
    isMobile: ref(false),
    isLargeDesktop: ref(false)
  }))
}));

vi.mock('@/services/api/pokemon-api', () => ({
  fetchPokemonData: vi.fn()
}));

// ❌ DON'T Mock: Utility functions that work fine in tests
// vi.mock('@/services/utils/color-utils') // These work fine!
// vi.mock('sleepapi-common') // These work fine!
```

**Mock only when necessary:**

- HTTP requests, database calls, file system operations
- External APIs and browser-specific features
- Vue composables when testing specific reactive behavior

**Don't mock:**

- Utility functions (formatters, calculators, validators)
- Internal services without external dependencies
- Functions from libraries that work in Node.js test environment

#### Reusable Mock Patterns

**Create centralized mocks for common interfaces:**

```typescript
// common/src/vitest/mocks/mock-tierlist.ts
export function tierlistSettings(attrs?: Partial<TierlistSettings>): TierlistSettings {
  return {
    camp: false,
    level: 50,
    ...attrs
  };
}

// Usage in tests
import { commonMocks } from 'sleepapi-common';
const mockSettings = commonMocks.tierlistSettings({ level: 60 });
```

**Mock file organization:**

- `common/src/vitest/mocks/` - for shared types
- `frontend/src/vitest/mocks/` - for frontend-specific mocks
- `backend/src/vitest/mocks/` - for backend-specific mocks
- Use factory functions: `function mockType(attrs?: Partial<Type>): Type`
- Export through index files for clean imports

#### Test Verification

**Always verify tests after creation/modification:**

```bash
# Run the specific test file immediately after creating/modifying
npx vitest --run -- testname.test.ts
```

**Self-verification workflow:**

1. Create or modify test file
2. Immediately run `npx vitest --run -- {testname}.test.ts`
3. If tests fail, analyze output and fix issues
4. Re-run tests until all pass
5. Only consider task complete when tests pass successfully
