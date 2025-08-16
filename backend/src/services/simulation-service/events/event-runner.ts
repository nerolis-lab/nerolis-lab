import { ModifierEngine } from '@src/events/engine/modifier-engine.js';
import { getActiveEvents, getEventsForSpecialty } from '@src/events/events/predefined-events.js';
import type { EventContext, EventResult } from 'sleepapi-common';
import type { Pokemon, PokemonInstance, TeamMemberExt, TeamSettingsExt } from 'sleepapi-common';

/**
 * Event runner integrates the event system with the simulation service
 * It applies active events to Pokemon instances before and during simulation
 */

export interface EventRunnerConfig {
  debug?: boolean;
  strict?: boolean;
  applyEventsOnInit?: boolean; // Apply events when creating team members
  applyEventsOnTick?: boolean; // Apply events during simulation ticks
}

export class EventRunner {
  private engine: ModifierEngine;
  private config: EventRunnerConfig;

  constructor(config: EventRunnerConfig = {}) {
    this.config = {
      debug: false,
      strict: false,
      applyEventsOnInit: true,
      applyEventsOnTick: false,
      ...config
    };

    this.engine = new ModifierEngine({
      debug: this.config.debug,
      strict: this.config.strict
    });
  }

  /**
   * Apply events to team members before simulation starts
   */
  async applyEventsToTeam(
    teamMembers: TeamMemberExt[],
    settings?: TeamSettingsExt,
    timestamp: Date = new Date()
  ): Promise<{
    modifiedMembers: TeamMemberExt[];
    eventResults: EventResult[];
  }> {
    if (!this.config.applyEventsOnInit) {
      return { modifiedMembers: teamMembers, eventResults: [] };
    }

    const activeEvents = getActiveEvents(timestamp);
    const allResults: EventResult[] = [];
    const modifiedMembers: TeamMemberExt[] = [];

    for (const member of teamMembers) {
      // Create a copy to avoid modifying the original
      const modifiedMember = structuredClone ? structuredClone(member) : JSON.parse(JSON.stringify(member));

      // Apply events that affect this member
      const relevantEvents = activeEvents.filter((event: any) => this.isEventRelevantForMember(event.name, member));

      for (const event of relevantEvents) {
        const context: EventContext = {
          pokemon: modifiedMember.pokemonWithIngredients.pokemon,
          pokemonInstance: modifiedMember,
          user: settings as any, // TeamSettings can be treated as user context
          timestamp,
          random: Math.random // Use system random for non-simulation events
        };

        try {
          const result = await this.engine.applyEvent(context, event);
          allResults.push(result);

          // Update the member with modified context
          if (result.success && result.context.pokemon) {
            modifiedMember.pokemonWithIngredients.pokemon = result.context.pokemon as any;
          }
          if (result.success && result.context.pokemonInstance) {
            Object.assign(modifiedMember, result.context.pokemonInstance);
          }

          this.log(`Applied event ${event.name} to ${member.pokemonWithIngredients.pokemon.name}:`, {
            appliedModifiers: result.appliedModifiers,
            skippedModifiers: result.skippedModifiers,
            errors: result.errors
          });
        } catch (error) {
          this.log(`Error applying event ${event.name} to ${member.pokemonWithIngredients.pokemon.name}:`, error);
          if (this.config.strict) {
            throw error;
          }
        }
      }

      modifiedMembers.push(modifiedMember);
    }

    return { modifiedMembers, eventResults: allResults };
  }

  /**
   * Apply events to a single Pokemon during simulation
   * This can be called during simulation ticks for dynamic effects
   */
  async applyEventsToPokemon(
    pokemon: Pokemon,
    pokemonInstance: PokemonInstance,
    timestamp: Date = new Date(),
    randomFn?: () => number
  ): Promise<{
    modifiedPokemon: Pokemon;
    modifiedInstance: PokemonInstance;
    eventResults: EventResult[];
  }> {
    if (!this.config.applyEventsOnTick) {
      return {
        modifiedPokemon: pokemon,
        modifiedInstance: pokemonInstance,
        eventResults: []
      };
    }

    const activeEvents = getActiveEvents(timestamp);
    const allResults: EventResult[] = [];

    // Create copies to avoid modifying originals
    const modifiedPokemon = structuredClone ? structuredClone(pokemon) : JSON.parse(JSON.stringify(pokemon));
    const modifiedInstance = structuredClone
      ? structuredClone(pokemonInstance)
      : JSON.parse(JSON.stringify(pokemonInstance));

    for (const event of activeEvents) {
      const context: EventContext = {
        pokemon: modifiedPokemon,
        pokemonInstance: modifiedInstance,
        timestamp,
        random: randomFn || Math.random
      };

      try {
        const result = await this.engine.applyEvent(context, event);
        allResults.push(result);

        // Update with modified context
        if (result.success && result.context.pokemon) {
          Object.assign(modifiedPokemon, result.context.pokemon);
        }
        if (result.success && result.context.pokemonInstance) {
          Object.assign(modifiedInstance, result.context.pokemonInstance);
        }
      } catch (error) {
        this.log(`Error applying event ${event.name} to ${pokemon.name}:`, error);
        if (this.config.strict) {
          throw error;
        }
      }
    }

    return {
      modifiedPokemon,
      modifiedInstance,
      eventResults: allResults
    };
  }

  /**
   * Get events that would affect a specific team member
   */
  getRelevantEventsForMember(member: TeamMemberExt, timestamp: Date = new Date()) {
    const activeEvents = getActiveEvents(timestamp);
    return activeEvents.filter((event) => this.isEventRelevantForMember(event.name, member));
  }

  /**
   * Get summary of active events and their effects
   */
  getActiveEventsSummary(timestamp: Date = new Date()) {
    const activeEvents = getActiveEvents(timestamp);
    return activeEvents.map((event: any) => ({
      id: event.name,
      name: event.name,
      description: event.description,
      category: event.category,
      rarity: event.rarity,
      modifierCount: event.modifiers.length,
      tags: event.tags
    }));
  }

  /**
   * Check if an event is relevant for a specific team member
   */
  private isEventRelevantForMember(eventId: string, member: TeamMemberExt): boolean {
    // For now, apply all events to all members
    // Could be enhanced with more sophisticated filtering based on:
    // - Pokemon species
    // - Pokemon specialty
    // - Member level
    // - Other criteria

    // Get events specific to this Pokemon's specialty
    const specialtyEvents = getEventsForSpecialty(member.pokemonWithIngredients.pokemon.specialty);
    const hasSpecialtyEvent = specialtyEvents.some((event: any) => event.name === eventId);

    // Apply general events to all, specialty events only to matching specialty
    return hasSpecialtyEvent || this.isGeneralEvent(eventId);
  }

  /**
   * Check if an event affects all Pokemon regardless of specialty
   */
  private isGeneralEvent(eventId: string): boolean {
    // Events that apply to all Pokemon
    const generalEventIds = ['evolution-advantage', 'weekend-boost', 'energy-efficiency'];

    return generalEventIds.includes(eventId);
  }

  /**
   * Log debug messages
   */
  private log(..._args: unknown[]): void {
    // TODO: Implement proper logging
  }
}

// Singleton instance for convenience
export const eventRunner = new EventRunner();
