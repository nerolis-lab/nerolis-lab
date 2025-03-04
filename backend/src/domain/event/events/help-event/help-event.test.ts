import { HelpEvent } from '@src/domain/event/events/help-event/help-event.js';
import { MOCKED_PRODUCE } from '@src/utils/test-utils/defaults.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { describe, expect, it } from 'vitest';

describe('HelpEvent', () => {
  it('help event shall format correctly', () => {
    const event = new HelpEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'pokemon',
      frequency: 1,
      nextHelp: TimeUtils.parseTime('06:10'),
      produce: MOCKED_PRODUCE
    });
    expect(event.format()).toMatchInlineSnapshot(
      `"[06:00:00][pokemon] Frequency: 1, produce: 2 GREPA + 1 Apple, next help: 06:10:00"`
    );
  });
});
