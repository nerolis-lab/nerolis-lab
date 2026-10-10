// @vitest-environment jsdom
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createVuetify } from 'vuetify';
import { VAvatar } from 'vuetify/components';
import { describe, expect, it, vi } from 'vitest';
import GuidesDocHeading from '../.vitepress/theme/components/GuidesDocHeading.vue';
import AboutAuthor from '../.vitepress/theme/components/AboutAuthor.vue';
import { getAvatarUrlForAuthorName } from '../.vitepress/theme/utils/format-utils';

vi.mock('vitepress', () => ({
  useData: () => ({
    frontmatter: { value: { fullTitle: 'Example guide', author: 'Tindo, Tooz' } }
  }),
  useRoute: () => ({ path: '/guides/' })
}));

describe('server-rendered author avatars', () => {
  it('renders avatar images in frontmatter author order during server rendering', async () => {
    const app = createSSRApp(GuidesDocHeading);
    app.use(createVuetify({ components: { VAvatar } }));
    const html = await renderToString(app);
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.querySelector('.author-names')?.textContent).toBe('by Tindo and Tooz');
    expect([...document.querySelectorAll('.author-avatar img')].map((img) => img.getAttribute('src'))).toEqual([
      getAvatarUrlForAuthorName('Tindo'),
      getAvatarUrlForAuthorName('Tooz')
    ]);
  });

  it('renders the author avatar image in AboutAuthor during server rendering', async () => {
    const app = createSSRApp(AboutAuthor, { author: 'Tooz', title: 'About Tooz' });
    app.use(createVuetify({ components: { VAvatar } }));
    const html = await renderToString(app);
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.querySelector('.avatar img')?.getAttribute('src')).toBe(getAvatarUrlForAuthorName('Tooz'));
  });
});
