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
npm run _compile                  # Backend type checking (in backend/)
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
4. **Type check**: `npm run type-check` (frontend) or `npm run _compile` (backend)
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

## Pokemon Sleep Game Mechanics

This section provides a comprehensive understanding of Pokemon Sleep's core mechanics as implemented in this application.

### Core Gameplay Loop

Pokemon Sleep is a sleep-tracking game where players:

1. Track their sleep to gain Sleep Score (max 100 per session)
2. Helper Pokemon gather berries and ingredients throughout the day
3. Feed Snorlax berries to increase its strength
4. Cook meals 3x daily using gathered ingredients
5. Weekly cycle resets every Monday at 04:00 local time

### Helper Pokemon Mechanics

#### Helping Frequency

- Pokemon "help" at regular intervals measured in seconds (see @common/src/types/pokemon/)
- Example: A Pokemon with 2400s frequency helps every 40 minutes
- Frequency is affected by energy level and various bonuses

#### Energy System (@backend/src/services/simulation-service/team-simulator/member-state/member-state.ts)

- Energy decreases by 1 every 10 minutes linearly throughout the day
- Energy affects helping frequency:
  - 80+ energy: 45% of base frequency (fastest)
  - 60-79 energy: 52% of base frequency
  - 40-59 energy: 58% of base frequency
  - 1-39 energy: 66% of base frequency
  - 0 energy: 100% of base frequency (slowest)
- Energy recovery occurs during sleep and from skills/meals

#### Sneaky Snacking

- When Pokemon reach their carry limit, they automatically deliver berries to Snorlax
- During sneaky snacking: only berries are delivered (no ingredients or skill procs)
- Pokemon continue gathering at the same rate but auto-deliver

#### Production Types

- **Berries**: Directly increase Snorlax strength
- **Ingredients**: Used for cooking meals
- Pokemon roll for ingredient finding based on their ingredient percentage (which may be boosted by subskills or nature)
- Base rates vary by species (see @common/src/types/pokemon/)

### Pokemon Specialties

Three main types of specialists with different strengths:

1. **Berry Specialists**: Higher berry output, lower ingredient/skill rates. Always 2 berries per drop baseline, and lower ingredient amounts (1 at level 1)
2. **Ingredient Specialists**: Higher ingredient rates, lower skill rate. Always 1 berry per drop baseline, but higher ingredient amounts (2 at level 1)
3. **Skill Specialists**: Higher skill trigger rates, can store 2 skill triggers before collecting. Lower ingredient rate and always 1 berry per drop and lower ingredient amounts (1 ingredient at level 1)

The "all" specialist also exists, and is currently only used on Darkrai.
Darkrai

### Main Skills

Skills trigger based on skill percentage (varies by Pokemon and specialty):

- See skills here: (@common/src/types/mainskill/mainskills/)
- Skills include energy recovery, strength boosts, ingredient gathering, crit boosts, etc.

### Cooking System (@backend/src/services/simulation-service/team-simulator/cooking-state/cooking-state.ts)

#### Meal Times

- **Breakfast**: 04:00 - 12:00
- **Lunch**: 12:00 - 18:00
- **Dinner**: 18:00 - 04:00

#### Cooking Mechanics

- Base critical hit chance: 10% (weekday), 30% (Sunday)
- Critical hits: 2x strength (weekday), 3x strength (Sunday)
- Pot size determines max ingredients per dish
- Good Camp bonus: +50% pot size, +20% helper speed/capacity

#### Recipe Types

- Three categories: Curries, Salads, Desserts
- Snorlax requests one type per week
- Higher level recipes provide more strength

### Snorlax & Islands

#### Research Areas

1. **Greengrass Isle**: Random berry preference weekly
2. **Cyan Beach**: Oran, Pecha, Pamtre berries
3. **Taupe Hollow**: Leppa, Figy, Sitrus berries
4. **Snowdrop Tundra**: Rawst, Persim, Wiki berries
5. **Lapis Lakeside**: Cheri, Mago, Durin berries
6. **Old Gold Power Plant**: Electric/Steel types

#### Snorlax Strength & Drowsy Power

- Strength calculation: @frontend/src/services/strength/strength-service.ts
- Favorite berries provide 2x strength
- Drowsy Power = Snorlax Strength × Sleep Score
- Higher Drowsy Power attracts more/rarer Pokemon

### Pokemon Stats & Progression

#### Natures (@common/src/types/nature/nature.ts)

Affect five key attributes:

- Speed of Help (helping frequency)
- Energy Recovery
- EXP Gains
- Ingredient Finding rate
- Main Skill Chance

#### Subskills (@common/src/types/subskill/subskills.ts)

- Unlocked at levels 10, 25, 50, 75, 100
- Include bonuses like Berry Finding S, Helping Speed M, Energy Recovery Bonus
- Cannot be changed after catching

#### Evolution

- Stats change upon evolution (see @common/src/types/pokemon/)
- Instanced properties remain (nature, subskills, ingredients)
- Some Pokemon have special requirements (stones, items)

### Sleep Tracking

#### Sleep Types

1. **Dozing**: Light sleep with movement/noise
2. **Snoozing**: REM sleep with snoring
3. **Slumbering**: Deep sleep, minimal movement
4. **Balanced**: Mix of multiple types

#### Sleep Score

- Based on sleep duration (90 minutes minimum)
- Max score: 100 points
- Directly converts to Pokemon EXP
- Multiplied with Snorlax Strength for Drowsy Power

### Items & Bonuses

#### Good Camp Ticket

- +50% pot size
- +20% helper speed
- +20% carry capacity
- Extra hungry Pokemon appears
- Lasts 7 days

#### Incense

- Recovery Incense: +5% energy recovery for box Pokemon
- Various types affect different aspects of gameplay

### Instance Properties (@common/src/types/instance/pokemon-instance.ts)

When catching Pokemon, these properties are rolled:

- Nature (unchangeable) (@common/src/types/nature/nature.ts)
- Subskills (5 total, unlocked at certain levels) (@common/src/types/subskill/subskills.ts)
- Ingredient sets (which specific ingredients from possibilities)
- Gender
- Shiny status (cosmetic only)

### Simulation Engine

The game simulation is implemented in:

- @backend/src/services/simulation-service/team-simulator/
- Handles energy decay, help timing, skill activations, cooking
- Runs Monte Carlo simulations for accurate predictions
