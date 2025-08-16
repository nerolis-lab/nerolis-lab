import type { TeamMemberExt, TeamSettingsExt } from 'sleepapi-common';
import { eventRunner } from './event-runner.js';

/**
 * Integration utilities for applying events in the simulation service
 * This provides helper functions to apply events before team simulation
 */

export interface SimulationEventConfig {
  applyEvents?: boolean;
  eventTimestamp?: Date;
  debug?: boolean;
}

/**
 * Pre-process team members by applying active events
 * Call this before creating TeamSimulator to apply event modifiers
 */
export async function preprocessTeamWithEvents(
  teamMembers: TeamMemberExt[],
  settings: TeamSettingsExt,
  config: SimulationEventConfig = {}
): Promise<{
  processedMembers: TeamMemberExt[];
  eventsSummary: any[];
  eventsApplied: boolean;
}> {
  const { applyEvents = true, eventTimestamp = new Date(), debug = false } = config;

  if (!applyEvents) {
    return {
      processedMembers: teamMembers,
      eventsSummary: [],
      eventsApplied: false
    };
  }

  // Configure event runner
  if (debug) {
    eventRunner['config'].debug = true;
  }

  try {
    // Apply events to team
    const { modifiedMembers, eventResults } = await eventRunner.applyEventsToTeam(
      teamMembers,
      settings,
      eventTimestamp
    );

    // Generate summary
    const eventsSummary = eventResults.map((result: any) => ({
      eventName: result.eventName,
      success: result.success,
      appliedModifiers: result.appliedModifiers,
      totalModifiers: result.totalModifiers,
      duration: result.duration,
      errors: result.errors.length > 0 ? result.errors : undefined
    }));

    if (debug && eventResults.length > 0) {
      // TODO: Add proper logging
      // eslint-disable-next-line SleepAPILogger/no-console
      console.log('[SimulationIntegration] Applied events:', {
        totalEvents: eventResults.length,
        successfulEvents: eventResults.filter((r: any) => r.success).length,
        totalModifiersApplied: eventResults.reduce((sum: any, r: any) => sum + r.appliedModifiers, 0)
      });
    }

    return {
      processedMembers: modifiedMembers,
      eventsSummary,
      eventsApplied: true
    };
  } catch (error) {
    // TODO: Add proper logging
    // eslint-disable-next-line SleepAPILogger/no-console
    console.error('[SimulationIntegration] Error applying events:', error);

    // Return original members if event processing fails
    return {
      processedMembers: teamMembers,
      eventsSummary: [{ error: String(error) }],
      eventsApplied: false
    };
  }
}

/**
 * Get information about currently active events
 */
export function getActiveEventsInfo(timestamp: Date = new Date()) {
  return eventRunner.getActiveEventsSummary(timestamp);
}

/**
 * Check if any events would affect a team
 */
export function wouldEventsAffectTeam(teamMembers: TeamMemberExt[], timestamp: Date = new Date()): boolean {
  return teamMembers.some((member) => {
    const relevantEvents = eventRunner.getRelevantEventsForMember(member, timestamp);
    return relevantEvents.length > 0;
  });
}

/**
 * Get events that would affect each team member
 */
export function getTeamEventsSummary(teamMembers: TeamMemberExt[], timestamp: Date = new Date()) {
  return teamMembers.map((member) => ({
    pokemonName: member.pokemonWithIngredients.pokemon.name,
    pokemonSpecialty: member.pokemonWithIngredients.pokemon.specialty,
    relevantEvents: eventRunner.getRelevantEventsForMember(member, timestamp).map((event: any) => ({
      id: event.name,
      name: event.name,
      description: event.description,
      modifierCount: event.modifiers.length
    }))
  }));
}
