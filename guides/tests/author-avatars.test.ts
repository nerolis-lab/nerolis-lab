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
    frontmatter: { value: { fullTitle: 'Raptor Berry Finding S Index', author: 'VelocityRaptor22, CowTools' } }
  }),
  useRoute: () => ({ path: '/guides/tier-lists/raptor-bfs-index' })
}));

describe('static author avatars', () => {
  it('includes both local images in the initial HTML, in author order', async () => {
    const app = createSSRApp(GuidesDocHeading);
    app.use(createVuetify({ components: { VAvatar } }));
    const html = await renderToString(app);
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.querySelector('.author-names')?.textContent).toBe('by VelocityRaptor22 and CowTools');
    expect([...document.querySelectorAll('.author-avatar img')].map((img) => img.getAttribute('src'))).toEqual([
      getAvatarUrlForAuthorName('VelocityRaptor22'),
      getAvatarUrlForAuthorName('CowTools')
    ]);
  });

  it('includes the local image in an AboutAuthor block without client-side loading', async () => {
    const app = createSSRApp(AboutAuthor, { author: 'CowTools', title: 'About CowTools' });
    app.use(createVuetify({ components: { VAvatar } }));
    const html = await renderToString(app);
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.querySelector('.avatar img')?.getAttribute('src')).toBe(getAvatarUrlForAuthorName('CowTools'));
  });
});
