import type { Event } from 'sleepapi-common';
import { EventBuilder } from '../builders/event-builder.js';

/**
 * Predefined events for the game
 * These are created by developers, not users
 * Adapted for Pokemon Sleep mechanics
 */

// The ingredient boost event - based on Pokemon Sleep ingredient mechanics
export const ingredientSpecialistEvent: Event = new EventBuilder(
  'Ingredient Specialist Boost',
  'All Pokemon get +1 ingredient amount, specialists sometimes get +2'
)
  // Everyone gets +1 to all ingredient amounts at different levels
  .addPokemonModifier('ingredient0.*.amount', '+', 1)
  .addPokemonModifier('ingredient30.*.amount', '+', 1)
  .addPokemonModifier('ingredient60.*.amount', '+', 1)

  // Ingredient specialists have 50% chance for another +1
  .addPokemonModifier('ingredient0.*.amount', '+', 1, {
    conditions: [
      {
        type: 'equals',
        field: 'specialty',
        value: 'ingredient'
      }
    ],
    probability: 0.5
  })
  .addPokemonModifier('ingredient30.*.amount', '+', 1, {
    conditions: [
      {
        type: 'equals',
        field: 'specialty',
        value: 'ingredient'
      }
    ],
    probability: 0.5
  })
  .addPokemonModifier('ingredient60.*.amount', '+', 1, {
    conditions: [
      {
        type: 'equals',
        field: 'specialty',
        value: 'ingredient'
      }
    ],
    probability: 0.5
  })
  .withMetadata({
    category: 'special',
    rarity: 'rare',
    tags: ['ingredient', 'boost', 'specialist'],
    icon: 'ingredient-boost',
    color: '#4CAF50',
    priority: 100
  })
  .build();

// Berry specialist frequency boost - affects helping frequency
export const berryFrenzyEvent: Event = new EventBuilder(
  'Berry Frenzy',
  'All Pokemon get 20% frequency boost, berry specialists get 32% total'
)
  .addPokemonModifier('frequency', '*', 0.8) // 20% boost = multiply by 0.8 (lower frequency = faster)
  .addPokemonModifier('frequency', '*', 0.9, {
    // Additional 10% for berry specialists (0.8 * 0.9 = 0.72 = ~28% boost total)
    conditions: [
      {
        type: 'equals',
        field: 'specialty',
        value: 'berry'
      }
    ]
  })
  .withSchedule(new Date('2024-12-01'), new Date('2024-12-31'))
  .withMetadata({
    category: 'seasonal',
    rarity: 'uncommon',
    tags: ['berry', 'frequency', 'december', 'seasonal'],
    icon: 'berry-frenzy',
    color: '#E91E63'
  })
  .build();

// Skill specialist enhancement
export const skillMasteryEvent: Event = new EventBuilder(
  'Skill Mastery Week',
  'Skill specialists get increased skill chance and carry size'
)
  .addPokemonModifier('skillPercentage', '+', 5, {
    conditions: [
      {
        type: 'equals',
        field: 'specialty',
        value: 'skill'
      }
    ]
  })
  .addPokemonModifier('carrySize', '+', 1, {
    conditions: [
      {
        type: 'equals',
        field: 'specialty',
        value: 'skill'
      }
    ]
  })
  .withMetadata({
    category: 'weekly',
    rarity: 'uncommon',
    tags: ['skill', 'specialist', 'carry', 'percentage'],
    icon: 'skill-mastery',
    color: '#9C27B0'
  })
  .build();

// Evolution advantage event based on Pokemon evolution mechanics
export const evolutionAdvantageEvent: Event = new EventBuilder(
  'Evolution Advantage',
  'Evolved Pokemon get progressive bonuses'
)
  // Base skill boost for all
  .addPokemonModifier('skillPercentage', '+', 3)

  // Additional boost for evolved Pokemon (1+ evolutions)
  .addPokemonModifier('skillPercentage', '+', 7, {
    conditions: [
      {
        type: 'greater',
        field: 'previousEvolutions',
        value: 0
      }
    ]
  })

  // Final evolution bonus
  .addPokemonModifier('carrySize', '+', 2, {
    conditions: [
      {
        type: 'equals',
        field: 'remainingEvolutions',
        value: 0
      }
    ]
  })

  // Middle evolution frequency bonus
  .addPokemonModifier('frequency', '*', 0.9, {
    conditions: [
      {
        type: 'greater',
        field: 'previousEvolutions',
        value: 0
      },
      {
        type: 'greater',
        field: 'remainingEvolutions',
        value: 0
      }
    ]
  })
  .withMetadata({
    category: 'special',
    rarity: 'epic',
    tags: ['evolution', 'progressive', 'skill'],
    icon: 'evolution',
    color: '#9C27B0',
    priority: 150
  })
  .build();

// Weekend boost for higher engagement
export const weekendBoostEvent: Event = new EventBuilder(
  'Weekend Boost',
  'Extra rewards and faster helping on weekends'
)
  .addPokemonModifier('frequency', '*', 0.75) // 25% frequency boost
  .addPokemonInstanceModifier('ribbon', '+', 1) // Extra ribbon reward
  .withRecurrence({
    type: 'weekly',
    daysOfWeek: [0, 6] // Sunday and Saturday
  })
  .withMetadata({
    category: 'weekly',
    rarity: 'uncommon',
    tags: ['weekend', 'boost', 'recurring'],
    icon: 'weekend',
    color: '#FF9800'
  })
  .build();

// Energy efficiency event
export const energyEfficiencyEvent: Event = new EventBuilder(
  'Energy Efficiency',
  'All Pokemon consume energy 15% slower'
)
  .addPokemonInstanceModifier('energyDecayRate', '*', 0.85) // 15% slower energy decay
  .withMetadata({
    category: 'daily',
    rarity: 'common',
    tags: ['energy', 'efficiency', 'endurance'],
    icon: 'energy',
    color: '#FFC107'
  })
  .build();

// Get all active events for a given date
export function getActiveEvents(date: Date = new Date()): Event[] {
  const allEvents = [
    ingredientSpecialistEvent,
    berryFrenzyEvent,
    skillMasteryEvent,
    evolutionAdvantageEvent,
    weekendBoostEvent,
    energyEfficiencyEvent
  ];

  return allEvents.filter((event) => {
    if (event.startDate && date < event.startDate) return false;
    if (event.endDate && date > event.endDate) return false;

    // Check if this is a weekend-only event (simplified recurrence)
    if (event.name === 'Weekend Boost') {
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    }

    // Check if this is a December-only event
    if (event.name === 'Berry Frenzy') {
      return date.getMonth() === 11; // December
    }

    return true;
  });
}

// Get events by category
export function getEventsByCategory(category: string, date: Date = new Date()): Event[] {
  // Note: category filtering not implemented in current Event interface
  return getActiveEvents(date);
}

// Get events affecting a specific Pokemon specialty
export function getEventsForSpecialty(specialty: string, date: Date = new Date()): Event[] {
  return getActiveEvents(date).filter((event) =>
    event.modifiers.some((modifier) =>
      modifier.conditions?.some((condition) => condition.field === 'specialty' && condition.value === specialty)
    )
  );
}
