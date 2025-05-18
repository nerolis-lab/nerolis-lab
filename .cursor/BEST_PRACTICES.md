# TypeScript Best Practices for Full-Stack Web Development

This document outlines best practices for using TypeScript across our full-stack web application, encompassing Node.js/Express/Knex on the backend and Vue.js/Vuetify/Pinia on the frontend. These guidelines aim to enhance code readability, performance, and maintainability, complementing our existing `codebase-conventions`.

## I. General TypeScript Practices

These practices apply to both frontend and backend development.

1.  **Enable Strict Mode**:

    - Always enable `strict` mode in your `tsconfig.json` (and related options like `strictNullChecks`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict`). This catches a large class of errors at compile time.
    - **Rationale**: Improves type safety and code quality significantly.

2.  **Type Everything Sensibly**:

    - Provide explicit types for function parameters, return values, and variable declarations where type inference isn't obvious or sufficient.
    - Use `unknown` instead of `any` when the type is truly unknown, forcing type checking before use. Reserve `any` for situations where you are genuinely working with dynamic content or migrating JavaScript code.
    - **Rationale**: Maximizes TypeScript's benefits, improves readability, and reduces runtime errors.

3.  **Prefer `interface` over `type` for Objects and Classes; `type` for Primitives, Unions, Tuples**:

    - Generally, `interface` is better for defining shapes of objects and can be extended. `type` is more versatile for unions, intersections, primitives, and more complex types.
    - **Your Convention**: Adhere to `PascalCase` for both, with no prefixes/suffixes.
    - **Rationale**: `interface` offers better performance and error messages for objects. `type` is more flexible for other scenarios.

4.  **Use Readonly Properties**:

    - Use the `readonly` modifier for properties that should not be changed after object creation.
    - For arrays that shouldn't be modified, use `ReadonlyArray<T>` or `readonly T[]`.
    - **Rationale**: Enhances immutability, making code easier to reason about and preventing unintended side effects.

5.  **Utility Types**:

    - Leverage built-in utility types like `Partial<T>`, `Readonly<T>`, `Record<K, T>`, `Pick<T, K>`, `Omit<T, K>`, etc., to create new types from existing ones without redundant definitions.
    - **Rationale**: Promotes DRY (Don't Repeat Yourself) and maintainable type definitions.

6.  **Avoid Enums (Consider String Literal Unions or Objects)**:

    - While your conventions don't explicitly forbid enums, consider using string literal unions (e.g., `type Status = 'pending' | 'approved' | 'rejected';`) or `as const` objects for better tree-shaking and often more straightforward JavaScript output.
    - The Luiz Barreto rule for Vue/TS explicitly suggests avoiding enums and using maps.
    - **Rationale**: Can lead to smaller bundle sizes and more predictable behavior, especially in frontend contexts.

7.  **Consistent Naming Conventions**:

    - Files & Directories: `kebab-case`
    - Variables: `camelCase`
    - Constants: `UPPER_SNAKE_CASE`
    - Functions: `camelCase`
    - Classes: `PascalCase`
    - Types/Interfaces: `PascalCase`
    - **Rationale**: Ensures consistency and readability across the project.

8.  **Modularity and Single Responsibility**:

    - Keep files and modules focused on a single responsibility.
    - Organize code into logical directories.
    - **Rationale**: Improves maintainability, testability, and navigation.

9.  **Linting and Formatting**:
    - Continue to use ESLint and Prettier as configured in the workspace to enforce coding style and formatting.
    - **Rationale**: Maintains code consistency automatically.

## II. Backend (Node.js, Express, MySQL with Knex)

1.  **`tsconfig.json` for Backend**:

    - Set `module` to `"NodeNext"`
    - Configure `rootDir` (e.g., `./src`) and `outDir` (e.g., `./dist`).
    - Ensure `@types/node`, `@types/express`, and types for other key libraries (e.g., `@types/knex` if available or custom types for Knex) are installed.
    - **Rationale**: Correct TypeScript compilation and type support for the Node.js environment.

2.  **Typed Express Routes and Middleware**:

    - Define interfaces or types for `Request`, `Response`, and `NextFunction` objects, especially for `req.body`, `req.params`, and `req.query`.
    - Example:

      ```typescript
      import { Request, Response, NextFunction } from 'express';

      interface CreateUserInput {
        username: string;
        email: string;
      }

      function createUser(req: Request<{}, {}, CreateUserInput>, res: Response) {
        // req.body is now typed as CreateUserInput
      }
      ```

    - **Rationale**: Provides type safety for request and response handling, reducing common errors.

3.  **Global Error Handling Middleware**:

    - Implement a typed global error handler at the end of your Express middleware chain.
    - Example:

      ```typescript
      import { Request, Response, NextFunction } from 'express';

      interface ErrorResponse {
        message: string;
        statusCode: number;
        // Add other relevant error fields
      }

      function globalErrorHandler(err: any, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
        console.error(err.stack);
        res.status(err.statusCode || 500).json({
          message: err.message || 'Internal Server Error',
          statusCode: err.statusCode || 500
        });
      }
      // app.use(globalErrorHandler);
      ```

    - **Rationale**: Centralizes error handling for consistent API responses and easier debugging.

4.  **Environment Variables**:

    - Load and validate environment variables using a dedicated configuration file (e.g., `src/config.ts`).
    - Define a type for your environment variables.
    - Use `dotenv` library for loading and `typebox` for validation.
    - **Rationale**: Ensures required configurations are present and correctly typed.

5.  **Separation of Concerns (App vs. Server)**:

    - Separate your Express application setup (`app.ts`) from the HTTP server instantiation (`server.ts`).
    - `app.ts`: Defines Express app, middleware, routes.
    - `server.ts`: Imports the app, creates an HTTP server, and listens on a port.
    - **Rationale**: Improves testability (app can be tested without starting a server) and organization.

6.  **Async/Await and Error Handling**:

    - Use `async/await` for all asynchronous operations (e.g., database queries with Knex, external API calls).
    - Wrap asynchronous route handlers and middleware in `try...catch` blocks, or use a utility to automatically catch errors and pass them to `next(error)`.
    - **Rationale**: Simplifies asynchronous code and ensures robust error propagation.

7.  **Knex.js Typing**:

    - When using Knex.js, define interfaces for your database table rows to get type safety in query results.
    - Each database table should have a DAO object that extends AbstractDAO, from `abstract-dao.ts`
    - **Rationale**: Improves safety and clarity when working with database results.

8.  **Service Layer**:
    - Abstract business logic into service classes or modules, separate from Express route handlers. Route handlers should primarily deal with HTTP request/response and call services.
    - **Rationale**: Promotes separation of concerns, testability, and reusability of business logic.

## III. Frontend (Vue.js, Vuetify, Pinia)

1.  **`tsconfig.json` for Frontend**:

    - Set `target` to `"ESNext"` or a modern ES version.
    - Set `module` to `"ESNext"`.
    - Set `moduleResolution` to `"Node"` or `"Bundler"`.
    - Include `"DOM"` in the `lib` array.
    - **Rationale**: Correct TypeScript configuration for the Vue.js and browser environment.

2.  **Vue 3 Composition API with `<script setup>`**:

    - Utilize `<script setup>` for all new components.
    - Example:

      ```vue
      <script setup lang="ts">
      import { ref, computed } from 'vue';

      interface Props {
        initialCount?: number;
      }
      const props = withDefaults(defineProps<Props>(), {
        initialCount: 0
      });

      const emit = defineEmits<{
        (e: 'increment', value: number): void;
      }>();

      const count = ref(props.initialCount);
      const doubleCount = computed(() => count.value * 2);

      function increment() {
        count.value++;
        emit('increment', count.value);
      }
      </script>
      ```

    - **Rationale**: More concise syntax, better type inference, and improved performance compared to Options API in TypeScript scenarios.

3.  **Typing Component Props and Emits**:

    - Use `defineProps<T>()` with an interface or type `T` for strong prop typing.
    - Use `withDefaults()` for optional props with default values.
    - Use `defineEmits<T>()` with a type literal for typed events.
    - **Rationale**: Enhances component API clarity and compile-time safety.

4.  **Pinia Store Typing**:

    - Clearly define types for your Pinia store's `state`, `getters`, and `actions`.
    - Example:

      ```typescript
      // stores/userStore.ts
      import { defineStore } from 'pinia';

      interface UserState {
        id: string | null;
        username: string | null;
        isAuthenticated: boolean;
      }

      export const useUserStore = defineStore('user', {
        state: (): UserState => ({
          id: null,
          username: null,
          isAuthenticated: false
        }),
        getters: {
          isLoggedIn: (state) => state.isAuthenticated,
          userInitial: (state) => state.username?.charAt(0).toUpperCase() || '?'
        },
        actions: {
          login(id: string, username: string) {
            this.id = id;
            this.username = username;
            this.isAuthenticated = true;
          },
          logout() {
            this.$reset(); // Resets to initial state
          }
        }
      });
      ```

    - Utilize `pinia-persistedstate` with appropriate type configurations if needed.
    - **Rationale**: Ensures type safety and predictability in your application's state management.

5.  **Typed Refs and Reactives**:

    - Provide explicit types for `ref` and `reactive` when TypeScript cannot infer them accurately, though often inference is sufficient.
    - Example: `const user = ref<User | null>(null);`
    - **Rationale**: Improves clarity and safety for reactive data.

6.  **API Service Module**:

    - Create a dedicated module for API calls (e.g., `src/services/api.ts` or feature-specific services like `src/services/userService.ts`).
    - Use a library like `axios` and configure interceptors for common tasks (e.g., adding auth tokens, error handling).
    - Define types for API request payloads and response data.
    - **Rationale**: Centralizes API logic, making it reusable and easier to manage.

7.  **Leverage VueUse**:

    - Consider using utility functions from `VueUse` for common tasks like managing browser APIs, state, animations, etc.
    - **Rationale**: Reduces boilerplate and provides well-tested, reactive utilities.

8.  **Vuetify Component Typing**:

    - Vuetify components generally have good TypeScript support. Refer to the Vuetify MCP or Vuetify documentation for types and information.
    - When extending or wrapping Vuetify components, ensure your props and emits are correctly typed.
    - **Rationale**: Ensures correct usage of Vuetify components.

9.  **Performance Considerations**:

    - **Code Splitting/Dynamic Imports**: Use dynamic imports for routes and components that are not immediately needed: `const MyComponent = () => import('./MyComponent.vue');`
    - **Tree Shaking**: Ensure your build setup (Vite) is configured for tree shaking to remove unused code. TypeScript helps with this by making imports explicit.
    - **Memoization**: For expensive computations in components, use `computed` properties. For functions outside components, consider memoization utilities if performance profiling indicates a bottleneck.
    - **Rationale**: Improves application load times and runtime performance.

10. **Shared Types with Backend**:
    - If possible, share common type definitions (e.g., API response/request structures, entity models) between your frontend and backend.
    - This can be achieved by:
      - A shared `types` directory in the common package within the monorepo.
      - Publishing types as a private NPM package.
    - **Rationale**: Reduces duplication, ensures consistency, and catches integration errors at compile time. This is highly recommended for your full-stack setup.

## IV. Testing (Vitest)

- Use Vitest as the primary framework.
- Co-locate test files (`moduleName.test.ts`).
- Use AAA pattern (Arrange-Act-Assert).
- Use clear test descriptions: "should do X when Y".
- Ensure your test environment is correctly configured for TypeScript (e.g., via Vitest's Vite integration).
- Mock dependencies effectively using Vitest's mocking features (`vi.mock`, `vi.fn`).
- Write type-safe tests by leveraging the types from your application code.
- **Rationale**: Ensures robust and maintainable tests that benefit from TypeScript's type safety.

## V. Development Workflow

1.  **IDE Setup**:

    - Cursor or otherwise VSCode-compatible IDE with the Volar extension (formerly VueDX) is highly recommended for Vue 3 + TypeScript development for the best SFC and script setup support.
    - Ensure ESLint and Prettier extensions are configured to format on save. These are installed in the root and opening the workspace automatically configures autoformat on save.
    - **Rationale**: Improves developer experience and productivity.

2.  **Backend Development**:

    - Use `bun` by running `npm run dev` for running TypeScript directly during development without manual compilation steps.
    - **Rationale**: Speeds up the development cycle.

3.  **Version Control**:
    - Ensure `.nvmrc` and `.npmrc` (or equivalent for your package manager) are committed to enforce Node.js and package manager versions for all developers (as suggested in Vue best practices).
    - **Rationale**: Consistency in development environments.

This document provides a comprehensive starting point. As the project evolves and the team gains more experience with TypeScript, these practices can be refined and expanded.
