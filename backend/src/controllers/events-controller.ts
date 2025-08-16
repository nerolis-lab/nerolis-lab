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

import { getActiveEvents, getEventsByCategory, getEventsForSpecialty } from '@src/events/index.js';
import {
  getActiveEventsInfo,
  getTeamEventsSummary
} from '@src/services/simulation-service/events/simulation-integration.js';
import { Route, Tags, Get, Query, Post, Body } from 'tsoa';
import type { Event, TeamMemberExt } from 'sleepapi-common';

@Route('events')
@Tags('Events')
export class EventsController {
  /**
   * Get all currently active events
   */
  @Get('active')
  public getActiveEvents(@Query() timestamp?: string): Event[] {
    const date = timestamp ? new Date(timestamp) : new Date();
    return getActiveEvents(date);
  }

  /**
   * Get active events summary with basic information
   */
  @Get('active/summary')
  public getActiveEventsSummary(@Query() timestamp?: string) {
    const date = timestamp ? new Date(timestamp) : new Date();
    return getActiveEventsInfo(date);
  }

  /**
   * Get events by category
   */
  @Get('category/{category}')
  public getEventsByCategory(category: string, @Query() timestamp?: string): Event[] {
    const date = timestamp ? new Date(timestamp) : new Date();
    return getEventsByCategory(category, date);
  }

  /**
   * Get events that affect a specific Pokemon specialty
   */
  @Get('specialty/{specialty}')
  public getEventsForSpecialty(specialty: string, @Query() timestamp?: string): Event[] {
    const date = timestamp ? new Date(timestamp) : new Date();
    return getEventsForSpecialty(specialty, date);
  }

  /**
   * Preview events for a team without applying them
   */
  @Post('preview')
  public getTeamEventsPreview(@Body() body: { teamMembers: TeamMemberExt[]; timestamp?: string }) {
    const { teamMembers, timestamp } = body;
    const date = timestamp ? new Date(timestamp) : new Date();

    return {
      timestamp: date.toISOString(),
      activeEvents: getActiveEventsInfo(date),
      teamEventsSummary: getTeamEventsSummary(teamMembers, date)
    };
  }
}
