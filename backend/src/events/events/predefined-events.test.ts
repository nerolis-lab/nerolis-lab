/**
 * Copyright 2025 Neroli's Lab Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from 'vitest';
import {
  ingredientSpecialistEvent,
  berryFrenzyEvent,
  skillMasteryEvent,
  evolutionAdvantageEvent,
  weekendBoostEvent,
  energyEfficiencyEvent,
  getActiveEvents,
  getEventsByCategory,
  getEventsForSpecialty
} from './predefined-events.js';

describe('Predefined Events', () => {
  describe('ingredientSpecialistEvent', () => {
    it('should have correct basic properties', () => {
      expect(ingredientSpecialistEvent.id).toBe('ingredient-boost-2024');
      expect(ingredientSpecialistEvent.name).toBe('Ingredient Specialist Boost');
      expect(ingredientSpecialistEvent.enabled).toBe(true);
      expect(ingredientSpecialistEvent.category).toBe('special');
      expect(ingredientSpecialistEvent.rarity).toBe('rare');
    });

    it('should have modifiers for all ingredient levels', () => {
      const paths = ingredientSpecialistEvent.modifiers.map((m: { path: string }) => m.path);
      expect(paths).toContain('ingredient0.*.amount');
      expect(paths).toContain('ingredient30.*.amount');
      expect(paths).toContain('ingredient60.*.amount');
    });

    it('should have specialist-specific modifiers with probability', () => {
      const specialistModifiers = ingredientSpecialistEvent.modifiers.filter(
        (m: any) => m.conditions && m.conditions.some((c: any) => c.field === 'specialty' && c.value === 'ingredient')
      );
      expect(specialistModifiers.length).toBeGreaterThan(0);
      specialistModifiers.forEach((modifier: any) => {
        expect(modifier.probability).toBe(0.5);
      });
    });
  });

  describe('berryFrenzyEvent', () => {
    it('should have correct schedule and category', () => {
      expect(berryFrenzyEvent.category).toBe('seasonal');
      expect(berryFrenzyEvent.startDate).toEqual(new Date('2024-12-01'));
      expect(berryFrenzyEvent.endDate).toEqual(new Date('2024-12-31'));
    });

    it('should have frequency modifiers', () => {
      const frequencyModifiers = berryFrenzyEvent.modifiers.filter((m: any) => m.path === 'frequency');
      expect(frequencyModifiers.length).toBeGreaterThan(0);
    });

    it('should have berry specialist specific modifiers', () => {
      const berrySpecificModifiers = berryFrenzyEvent.modifiers.filter(
        (m: any) => m.conditions && m.conditions.some((c: any) => c.field === 'specialty' && c.value === 'berry')
      );
      expect(berrySpecificModifiers.length).toBeGreaterThan(0);
    });
  });

  describe('skillMasteryEvent', () => {
    it('should target skill specialists only', () => {
      skillMasteryEvent.modifiers.forEach((modifier: any) => {
        expect(modifier.conditions).toBeDefined();
        expect(modifier.conditions![0].field).toBe('specialty');
        expect(modifier.conditions![0].value).toBe('skill');
      });
    });

    it('should modify skill-related properties', () => {
      const paths = skillMasteryEvent.modifiers.map((m: any) => m.path);
      expect(paths).toContain('skillPercentage');
      expect(paths).toContain('carrySize');
    });
  });

  describe('evolutionAdvantageEvent', () => {
    it('should have progressive bonuses based on evolution status', () => {
      const evolutionBasedModifiers = evolutionAdvantageEvent.modifiers.filter(
        (m: any) =>
          m.conditions &&
          m.conditions.some((c: any) => c.field === 'previousEvolutions' || c.field === 'remainingEvolutions')
      );
      expect(evolutionBasedModifiers.length).toBeGreaterThan(0);
    });

    it('should have base modifier for all Pokemon', () => {
      const baseModifiers = evolutionAdvantageEvent.modifiers.filter((m: any) => !m.conditions);
      expect(baseModifiers.length).toBeGreaterThan(0);
    });
  });

  describe('weekendBoostEvent', () => {
    it('should have weekly recurrence on weekends', () => {
      expect(weekendBoostEvent.recurrence).toBeDefined();
      expect(weekendBoostEvent.recurrence!.type).toBe('weekly');
      expect(weekendBoostEvent.recurrence!.daysOfWeek).toEqual([0, 6]); // Sunday and Saturday
    });

    it('should be categorized as weekly', () => {
      expect(weekendBoostEvent.category).toBe('weekly');
    });
  });

  describe('energyEfficiencyEvent', () => {
    it('should target PokemonInstance', () => {
      energyEfficiencyEvent.modifiers.forEach((modifier: any) => {
        expect(modifier.targetType).toBe('PokemonInstance');
      });
    });

    it('should modify energy-related properties', () => {
      const paths = energyEfficiencyEvent.modifiers.map((m: any) => m.path);
      expect(paths).toContain('energyDecayRate');
    });
  });
});

describe('Event Utility Functions', () => {
  describe('getActiveEvents', () => {
    it('should return all events when no date restrictions', () => {
      const events = getActiveEvents(new Date('2025-01-15'));
      expect(events.length).toBeGreaterThan(0);

      // Should include events without date restrictions
      const eventIds = events.map((e: any) => e.id);
      expect(eventIds).toContain('ingredient-boost-2024');
      expect(eventIds).toContain('skill-mastery-week');
      expect(eventIds).toContain('evolution-advantage');
      expect(eventIds).toContain('energy-efficiency');
    });

    it('should exclude events outside date range', () => {
      // Berry frenzy event is only for December 2024
      const events = getActiveEvents(new Date('2025-01-15'));
      const eventIds = events.map((e: any) => e.id);
      expect(eventIds).not.toContain('berry-frenzy-december');
    });

    it('should include seasonal events within date range', () => {
      const events = getActiveEvents(new Date('2024-12-15'));
      const eventIds = events.map((e: any) => e.id);
      expect(eventIds).toContain('berry-frenzy-december');
    });

    it('should handle weekend events on correct days', () => {
      // Sunday
      const sundayEvents = getActiveEvents(new Date('2025-01-12')); // Sunday
      const sundayEventIds = sundayEvents.map((e: any) => e.id);
      expect(sundayEventIds).toContain('weekend-boost');

      // Wednesday (should not include weekend event)
      const wednesdayEvents = getActiveEvents(new Date('2025-01-15')); // Wednesday
      const wednesdayEventIds = wednesdayEvents.map((e: any) => e.id);
      expect(wednesdayEventIds).not.toContain('weekend-boost');
    });
  });

  describe('getEventsByCategory', () => {
    it('should filter events by category', () => {
      const specialEvents = getEventsByCategory('special');
      expect(specialEvents.every((e: any) => e.category === 'special')).toBe(true);

      const weeklyEvents = getEventsByCategory('weekly');
      expect(weeklyEvents.every((e: any) => e.category === 'weekly')).toBe(true);

      const seasonalEvents = getEventsByCategory('seasonal', new Date('2024-12-15'));
      expect(seasonalEvents.every((e: any) => e.category === 'seasonal')).toBe(true);
    });
  });

  describe('getEventsForSpecialty', () => {
    it('should return events that affect berry specialists', () => {
      const berryEvents = getEventsForSpecialty('berry', new Date('2024-12-15'));
      const eventIds = berryEvents.map((e: any) => e.id);
      expect(eventIds).toContain('berry-frenzy-december');
    });

    it('should return events that affect skill specialists', () => {
      const skillEvents = getEventsForSpecialty('skill');
      const eventIds = skillEvents.map((e: any) => e.id);
      expect(eventIds).toContain('skill-mastery-week');
    });

    it('should return events that affect ingredient specialists', () => {
      const ingredientEvents = getEventsForSpecialty('ingredient');
      const eventIds = ingredientEvents.map((e: any) => e.id);
      expect(eventIds).toContain('ingredient-boost-2024');
    });

    it('should not return events for unmatched specialties', () => {
      const skillEvents = getEventsForSpecialty('skill');
      const eventIds = skillEvents.map((e: any) => e.id);
      expect(eventIds).not.toContain('ingredient-boost-2024');
    });
  });
});
