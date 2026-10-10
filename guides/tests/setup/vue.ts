import { config } from '@vue/test-utils';
import { vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';

config.global.plugins.push(createVuetify({ components, directives }));

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
vi.stubGlobal('matchMedia', (media: string) => ({
  matches: false,
  media,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}));
vi.stubGlobal('visualViewport', new EventTarget());
