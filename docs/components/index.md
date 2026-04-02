# Components Overview

Neroli's Lab is structured as a monorepo containing the main application components (frontend, backend, common) plus player guides and other tooling, which together provide a comprehensive Pokémon Sleep analysis platform.

## Components

### 🌐 Frontend - Web Application

**Location**: `frontend/`  
**Technology**: Vue.js 3, Vuetify 3, TypeScript

The user-facing web application that provides:

- Interactive calculators for production
- Team composition optimization tools
- Cooking tier lists and recipe recommendations
- User authentication and profile management
- Data visualization and analysis tools

**Key Features**:

- Responsive design for desktop and mobile
- Integration with backend APIs
- User-friendly interface for complex calculations

[📖 Frontend Documentation →](./frontend)

---

### 🔧 Backend - REST API Server

**Location**: `backend/`  
**Technology**: TypeScript, Express.js, MySQL+Knex, Node.js/Bun

The core API server that handles:

- RESTful API endpoints for all data operations
- User authentication and authorization
- Complex calculation processing, all simulations
- Database management and migrations

**Key Features**:

- Comprehensive REST API with Express
- OAuth2 authentication (Google, Discord, Patreon)
- Database management with Knex
- Worker threads for traffic-heavy API routes

[📖 Backend Documentation →](./backend)

---

### 📚 Common Library - Shared Code

**Location**: `common/`  
**Technology**: TypeScript, Rollup

The shared library containing:

- Domain models and type definitions
- Shared API types, constants and enums
- Testing utilities and mock data
- Shared utilities

[📖 Common Library Documentation →](./common)

---

### 📖 Player guides (VitePress)

**Location**: `guides/`  
**Technology**: VitePress, Vue 3, Vuetify (theme shell), Markdown

Player-facing documentation for Pokémon Sleep mechanics. The built site is deployed with the main web app and served at **`/guides/`** (for example [nerolislab.com/guides/](https://nerolislab.com/guides/)).

## Data Flow

### User Calculation Request

1. **User Input**: User enters data in frontend
2. **API Call**: Frontend sends a calculation request to backend
3. **Processing**: Backend runs simulations on our server
4. **Database**: Backend retrieves Pokémon/user data from database
5. **Response**: Results returned to frontend for display

### Data Updates

1. **Source Data**: New Pokémon Sleep data becomes available
2. **Database Migration**: Backend updates database schema/data
3. **Cache Invalidation**: Simply bumping the version in [version.ts](../../common/src/types/version.ts) invalidates the user's client cache
4. **Notification**: Admins have the option to send out news notifications on the frontend site

### Frontend ↔ Backend

- **Protocol**: HTTP REST API
- **Format**: JSON
- **Authentication**: JWT tokens from OAuth2 providers (automatically included in headers)

### Shared Types

All components use the same TypeScript types from the common library:

```typescript
// Defined in common/
export interface Pokemon {
  id: number;
  name: string;
  berry: Berry;
  ingredient: Ingredient;
  skill: MainSkill;
}

// Used in all components
import { Pokemon } from 'sleepapi-common';
```

## Configuration Management

### Environment Variables

Each component has its own `.env` file:

```
backend/.env          # Database, API keys etc
frontend/.env         # OAuth client IDs
common/               # No environment variables needed
```

This modular architecture enables independent development while maintaining consistency through the shared common library.
