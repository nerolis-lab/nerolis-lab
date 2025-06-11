# Neroli's Lab - Common Library

The `sleepapi-common` package is a shared TypeScript library that contains common domain models, utilities, and types used across all components of Neroli's Lab.

## Overview

This package provides:

- **Domain Models** - Core entities and data structures for Pokémon Sleep
- **API Types** - Shared type definitions for API requests/responses
- **Utilities** - Common helper functions and utilities
- **Testing Utilities** - Shared testing helpers via vimic

## Development

### Building the Library

```bash
npm run build
```

This will:

1. Clean the `dist` directory
2. Build using Rollup with TypeScript support
3. Include TypeScript declarations

### Watch Mode

For development, you can build in watch mode:

```bash
npm run build-watch
```

### Testing

Run the test suite:

```bash
npm run test          # Run once with coverage
npm run test-watch    # Watch mode
```

### Type Checking

Run TypeScript type checking in watch mode:

```bash
npm run type-watch
```

## Project Structure

```
src/
├── domain/          # Core domain models and entities
├── api/             # API-related types and interfaces, might be moved to domain
├── utils/           # Common utility functions
├── vitest/          # Testing utilities
├── prototype/       # Native class extensions
└── index.ts         # Main entry point
```

## Usage

Since this is a private package used internally by other Neroli's Lab components, it's typically installed as a local dependency:

```json
{
  "dependencies": {
    "sleepapi-common": "file:../common"
  }
}
```

Import from the package:

```typescript
import { SomeDomainModel, ApiResponse } from 'sleepapi-common';
```

## Build Configuration

The library uses Rollup for building with:

- TypeScript compilation
- Dual format output (CommonJS + ES modules)
- Declaration file generation
- Node.js resolution

See `rollup.config.mjs` for complete build configuration.

## Testing

Tests are written using Vitest and located alongside source files with `.test.ts` extensions. The library includes comprehensive test coverage reporting.

## Development Guidelines

When contributing to the common library, please follow these guidelines:

### Public API

- **Maintain clean public API** - Keep the exported interface simple and well-designed
- **Backward compatibility** - Avoid breaking changes when possible
- **Clear naming conventions** - Use descriptive and consistent naming for exports

### Type Definitions

- **Export all necessary types** - Make TypeScript interfaces and types available to consumers, re-export with index.ts files
- **Comprehensive type coverage** - Ensure all public APIs are properly typed
- **Generic types** - Use generics appropriately for reusable functionality

### Testing

- **Comprehensive unit test coverage** - Test all your code changes
- **Test edge cases** - Include tests for error conditions and boundary cases
- **Fast test execution** - Keep tests lightweight and fast-running

### Documentation

- **JSDoc comments for public APIs** - Document any complex interface or function with JSDoc
- **Usage examples** - Provide clear examples in documentation
- **Keep documentation current** - Update docs when making changes to APIs
