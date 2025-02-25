# Neroli's Lab Development Guide

## Build & Test Commands
- **Build common module**: `cd common && npm run build`
- **Run backend**: `cd backend && npm run dev`
- **Run frontend**: `cd frontend && npm run dev`
- **Run tests**: `cd [directory] && npm run test`
- **Run single test**: `cd [directory] && npx vitest [test-file-name]`
- **Run changed tests only**: `cd [directory] && npm run test-watch`
- **Lint check**: `npm run lint`
- **Lint fix**: `npm run lint-fix`
- **Type check backend**: `cd backend && npm run compile`
- **Type check frontend**: `cd frontend && npm run type-check`

## Code Style
- **Format**: Use Prettier with singleQuote, 120 chars width, 2 spaces indent
- **Commit standard**: Conventional commits (e.g., `feat:`, `fix:`, `docs:`, etc.)
- **Logging**: Use `logger` instead of `console` for logging
- **Types**: Strict TypeScript with no implicit any (`noImplicitAny: true`)
- **Imports**: Use type imports with `import type` for type-only imports
- **Error handling**: Write comprehensive error handling, no silent failures
- **Testing**: Write tests with Vitest for all new functionality
- **Backend**: Use ESM modules with `.js` extension in imports
- **Frontend**: No semicolons in Vue files; semicolons elsewhere
- **Paths**: Use path aliases (e.g., `@src/`) where configured