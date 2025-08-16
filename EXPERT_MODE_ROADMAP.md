# Pokemon Sleep Expert Mode Implementation Roadmap

## Overview

Pokemon Sleep's Expert Mode is a new challenging game mode with complex mechanics affecting Pokemon performance based on berry type matching. This roadmap outlines the implementation plan for adding Expert Mode support to Neroli's Lab.

## Current Architecture Analysis

### Simulation Engine (@backend/src/services/simulation-service/team-simulator/)

- **TeamSimulator**: Main simulation orchestrator
- **MemberState**: Tracks individual Pokemon performance, energy, helps, production
- **CookingState**: Handles meal cooking and critical hits
- **SkillState**: Manages main skill activations and effects

### Key Types (@common/src/types/)

- **Pokemon** (@common/src/types/pokemon/pokemon.ts): Base stats (frequency, ingredient%, skill%, berry type)
- **PokemonInstance** (@common/src/types/instance/pokemon-instance.ts): Caught instance (level, nature, subskills, skillLevel)
- **TeamMemberExt** (@common/src/types/team/member.ts): Combined Pokemon + settings for simulation
- **TeamSettingsExt** (@common/src/types/team/team.ts): Team-wide settings (camp, sleep times, pot size)

### Database Schema

- **user_area** table: Stores user's area bonus per island
- **team** table: Team settings including camp, bedtime, wakeup
- **pokemon** table: Individual Pokemon instances
- **team_member** table: Links Pokemon to teams

## Expert Mode Requirements

### Core Mechanics

1. **Berry Type Categorization**: Berries split into "matched" (1 main + 2 sub-favorites) and "mismatched" (all others)
2. **Performance Modifiers**: Different buffs/nerfs based on berry type match
3. **Weekly Random Bonus**: Additional rotating boost each week
4. **Island-Specific**: Initially Greengrass Isle, expanding to all islands
5. **Expert Tickets**: Required consumable for Expert Mode access

### Performance Modifiers (Estimated)

**Matched Berry Pokemon (Main Type)**:

- Berry strength: ×2.4 (vs normal ×2.0 favored)
- Helping speed: +15% faster
- Skill proc rate: +25%
- Main skill level: +1 effective level
- Ingredient count: Unknown boost

**Matched Berry Pokemon (Sub Types)**:

- Berry strength: ×2.4 (same as main)
- Other bonuses: TBD (likely reduced vs main type)

**Mismatched Berry Pokemon**:

- Helping speed: -10% slower
- Other stats: Unchanged

## Implementation Strategy

### Phase 1: Foundation & Architecture (Week 1-2)

#### 1.1 Modifier System Design

Create a flexible system to apply performance modifiers to Pokemon during simulation.

**New Types** (@common/src/types/):

```typescript
// New modifier system types
interface PokemonModifier {
  id: string;
  name: string;
  description: string;
  target: 'base' | 'instance'; // Base Pokemon stats vs instance properties
  conditions: ModifierCondition[];
  effects: ModifierEffect[];
}

interface ModifierEffect {
  type: 'frequency' | 'ingredientPercent' | 'skillPercent' | 'skillLevel' | 'berryStrength' | 'ingredientCount';
  operation: 'multiply' | 'add' | 'set';
  value: number;
  probabilistic?: boolean; // For effects like "sometimes +2 ingredients"
}

interface ModifierCondition {
  type: 'berryMatch' | 'specialty' | 'pokemon' | 'island';
  value: string | string[];
}

interface SimulationModifiers {
  teamModifiers: PokemonModifier[];
  memberModifiers: Map<string, PokemonModifier[]>; // keyed by externalId
}
```

#### 1.2 Expert Mode Settings Extension

Extend existing types to support Expert Mode configuration.

**Database Migration**:

```sql
ALTER TABLE user_area ADD COLUMN expert_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE user_area ADD COLUMN main_favorite_berry VARCHAR(255);
ALTER TABLE user_area ADD COLUMN sub_favorite_berries JSON; -- Array of 2 berry names
ALTER TABLE user_area ADD COLUMN weekly_bonus_modifier VARCHAR(255);
```

**Type Extensions** (@common/src/types/):

```typescript
interface ExpertModeSettings {
  enabled: boolean;
  mainFavoriteBerry: string;
  subFavoriteBerries: string[];
  weeklyBonusModifier?: string;
}

// Extend existing TeamSettingsExt
interface TeamSettingsExt {
  // ... existing fields
  expertMode?: ExpertModeSettings;
}
```

#### 1.3 Simulation Integration Points

Identify where modifiers will be applied in the simulation pipeline.

**MemberState Modifications** (@backend/src/services/simulation-service/team-simulator/member-state/member-state.ts):

- Constructor: Apply base stat modifiers
- `calculateFrequencyWithEnergy()`: Apply frequency modifiers
- `attemptDayHelpInner()`: Apply ingredient count modifiers (probabilistic)
- Skill activation: Apply skill level and proc rate modifiers

**Strength Calculation** (@frontend/src/services/strength/strength-service.ts):

- Move to backend for consistency
- Apply berry strength modifiers based on Expert Mode settings

### Phase 2: Core Expert Mode Implementation (Week 3-4)

#### 2.1 Backend API Changes

**New Endpoints**:

```typescript
// Update user area with expert mode settings
PUT /api/user-area/:island/expert-mode
{
  enabled: boolean;
  mainFavoriteBerry: string;
  subFavoriteBerries: string[];
}

// Get expert mode weekly bonus (mock random selection initially)
GET /api/expert-mode/weekly-bonus/:island
```

**DAO Updates** (@backend/src/database/dao/user-area/):

- Support CRUD operations for expert mode settings
- Validate berry selections against island-specific berries

#### 2.2 Modifier System Implementation

**ModifierEngine** (@backend/src/services/modifier-service/):

```typescript
class ModifierEngine {
  static applyModifiers(member: TeamMemberExt, modifiers: PokemonModifier[]): TeamMemberExt;

  static calculateRuntimeModifiers(helpCount: number, modifiers: PokemonModifier[]): RuntimeModifierValues;
}
```

**Expert Mode Modifier Factory**:

```typescript
class ExpertModeModifierFactory {
  static createModifiers(expertSettings: ExpertModeSettings, memberBerry: string): PokemonModifier[];
}
```

#### 2.3 Simulation Engine Integration

**TeamSimulator Updates** (@backend/src/services/simulation-service/team-simulator/):

- Accept modifiers in constructor
- Apply modifiers to each MemberState during initialization
- Pass runtime modifiers for probabilistic effects

**MemberState Runtime Modifications**:

- Cache modified stats for performance
- Handle probabilistic effects (ingredient count bonuses)
- Apply skill level modifiers to skill activation logic

### Phase 3: Frontend Integration (Week 5-6)

#### 3.1 Expert Mode Toggle UI

**Island Selection Enhancement** (@frontend/src/pages/):

- Add Expert Mode toggle per island
- Show requirements (Master 18+ for Greengrass)
- Visual indicators for Expert Mode status

**Expert Mode Configuration Modal**:

- Berry selection interface (main + 2 sub favorites)
- Validation against island-available berries
- Preview of expected modifiers

#### 3.2 Team Calculator Integration

**Team Page Updates** (@frontend/src/pages/team/):

- Detect Expert Mode settings from user area
- Pass Expert Mode config to backend simulation calls
- Display modifier effects in results

**Performance Display Enhancements**:

- Show modified stats vs base stats
- Highlight Expert Mode bonuses/penalties
- Berry type matching indicators

#### 3.3 Strength Calculation Migration

**Move to Backend** (@backend/src/services/strength-service/):

- Migrate `StrengthService` from frontend to backend
- Apply berry strength modifiers based on Expert Mode
- Maintain API compatibility with frontend

### Phase 4: Advanced Features (Week 7-8)

#### 4.1 Weekly Bonus System

**Random Bonus Implementation**:

```typescript
interface WeeklyBonus {
  id: string;
  name: string;
  description: string;
  modifiers: PokemonModifier[];
  validUntil: Date;
}

class WeeklyBonusService {
  static generateWeeklyBonus(island: string): WeeklyBonus;
  static getCurrentBonus(island: string): WeeklyBonus | null;
}
```

#### 4.2 Event System Foundation

**Generic Event Modifiers**:

- Extend modifier system for timed events
- Support event stacking with Expert Mode
- Configuration-driven event creation

**Event Management API**:

```typescript
// Admin endpoints for event management
POST /api/admin/events
PUT /api/admin/events/:eventId
DELETE /api/admin/events/:eventId

// Public endpoint for active events
GET /api/events/active
```

#### 4.3 Performance Optimizations

**Simulation Caching**:

- Cache modifier calculations
- Pre-compute common modifier combinations
- Optimize probabilistic effect handling

**Database Indexing**:

- Index expert mode settings queries
- Optimize user area lookups

### Phase 5: Testing & Polish (Week 9-10)

#### 5.1 Comprehensive Testing

**Unit Tests**:

- Modifier system edge cases
- Probabilistic effect accuracy
- Expert Mode configuration validation

**Integration Tests**:

- End-to-end Expert Mode simulation
- Frontend-backend Expert Mode flow
- Performance regression testing

**Simulation Accuracy**:

- Validate modifier math against expected values
- Compare with community data when available

#### 5.2 User Experience Polish

**Performance Feedback**:

- Loading states for Expert Mode calculations
- Error handling for invalid configurations
- Tooltips explaining Expert Mode mechanics

**Documentation**:

- Update CLAUDE.md with Expert Mode mechanics
- User guides for Expert Mode configuration
- API documentation updates

## Technical Considerations

### Future-Proofing

1. **Extensible Modifier System**: Support new modifier types without code changes
2. **Island Expansion**: Easy addition of Expert Mode to new islands
3. **Event Integration**: Seamless integration with temporary events

### Performance Implications

1. **Simulation Complexity**: Additional calculations per help iteration
2. **Memory Usage**: Modifier storage and caching
3. **Database Load**: Expert Mode settings queries

### Data Management

1. **Migration Strategy**: Backward compatibility for existing users
2. **Default Values**: Sensible defaults for Expert Mode settings
3. **Validation**: Robust berry selection validation

## Risk Mitigation

### Unknown Mechanics

- **Flexible Implementation**: Design for easy adjustment as mechanics are clarified
- **Configuration-Driven**: Minimize hardcoded values
- **A/B Testing**: Support for gradual rollout

### Performance Risks

- **Profiling**: Monitor simulation performance impact
- **Caching Strategy**: Aggressive caching of modifier calculations
- **Fallback Options**: Graceful degradation if Expert Mode fails

### User Experience Risks

- **Complexity Management**: Progressive disclosure of Expert Mode features
- **Clear Communication**: Obvious indicators of Expert Mode status
- **Error Recovery**: Helpful error messages and recovery options

## Success Metrics

### Technical Metrics

- Expert Mode simulation performance within 150% of normal mode
- < 1% increase in API error rates
- Zero data integrity issues

### User Experience Metrics

- Expert Mode adoption rate > 20% of eligible users
- Configuration completion rate > 80%
- User retention unchanged or improved

## Conclusion

This roadmap provides a comprehensive plan for implementing Pokemon Sleep Expert Mode support in Neroli's Lab. The phased approach balances early delivery of core functionality with robust architecture for future expansion. The modifier system design enables not only Expert Mode but also future event implementations, providing significant long-term value.

Key success factors:

1. **Flexible Architecture**: The modifier system supports unknown future requirements
2. **Performance Focus**: Maintaining simulation speed despite added complexity
3. **User-Centric Design**: Clear communication of Expert Mode benefits and mechanics
4. **Future-Proofing**: Easy expansion to additional islands and event types

Timeline: ~10 weeks for full implementation
Priority: High - Major new game feature with significant user impact
