# Common Library API Reference

The `sleepapi-common` library provides TypeScript types and utilities used across Neroli's Lab components.

## Generating API Documentation

To generate comprehensive API documentation from the TypeScript source code, you can use TypeDoc:

### Setup TypeDoc

```bash
npm install -D typedoc typedoc-plugin-markdown
```

### Generate Documentation

```bash
# Generate HTML documentation
npx typedoc --out docs/api/generated common/src/index.ts

# Generate markdown documentation
npx typedoc --plugin typedoc-plugin-markdown --out docs/api/generated common/src/index.ts
```

### TypeDoc Configuration

Create `typedoc.json` in the project root:

```json
{
  "entryPoints": ["./common/src/index.ts"],
  "out": "./docs/api/generated",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "./common/README.md",
  "name": "Neroli's Lab Common Library",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeExternals": true,
  "categorizeByGroup": false,
  "defaultCategory": "Other",
  "categoryOrder": ["Domain Models", "API Types", "Utilities", "Other"]
}
```

## Key Exports

The common library exports the following main categories:

### Domain Models

Core data structures representing Pokémon Sleep entities like Pokémon, berries, ingredients, skills, etc.

### API Types

Request/response types and interfaces for API communication.

### Utilities

Helper functions for calculations, data transformations, and common operations.

### Testing Utilities

Shared testing helpers and mock data for use in tests across components.

## Auto-Documentation Integration

You can integrate TypeDoc generation into the VitePress build process by:

1. Adding TypeDoc to the build pipeline
2. Using VitePress plugins to include generated documentation
3. Setting up automated regeneration on code changes

### Example Integration Script

```javascript
// scripts/generate-docs.js
const TypeDoc = require('typedoc');

async function generateApiDocs() {
  const app = new TypeDoc.Application();

  app.options.addReader(new TypeDoc.TSConfigReader());
  app.bootstrap({
    entryPoints: ['./common/src/index.ts'],
    plugin: ['typedoc-plugin-markdown'],
    out: './docs/api/generated'
  });

  const project = app.convert();

  if (project) {
    await app.generateDocs(project, './docs/api/generated');
    console.log('API documentation generated successfully');
  }
}

generateApiDocs().catch(console.error);
```

Add to package.json scripts:

```json
{
  "scripts": {
    "docs:api": "node scripts/generate-docs.js",
    "docs:dev": "npm run docs:api && vitepress dev docs",
    "docs:build": "npm run docs:api && vitepress build docs"
  }
}
```

This ensures API documentation is always up-to-date when building the documentation site.
