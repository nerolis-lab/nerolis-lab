import type { Event } from '../../../types/events/event-types';
import { mockModifier } from '../modifier';

export function event(attrs?: Partial<Event>): Event {
  const now = new Date();
  return {
    name: 'Test Event',
    description: 'Test event description',
    modifiers: [mockModifier()],
    startDate: new Date(now.getTime() - 86400000), // Yesterday
    endDate: new Date(now.getTime() + 86400000), // Tomorrow
    createdBy: 'test-user-123',
    createdAt: now,
    updatedAt: now,
    ...attrs
  };
}
