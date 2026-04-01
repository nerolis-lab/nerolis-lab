/**
 * Canonical site navigation for the main app drawer and guides chrome.
 * Keep labels, paths, icons, and flags in one place so SPA and guides stay aligned.
 */

export interface SiteNavItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: string;
  /** Use in-app routing (`to`); false for full navigation (`href`), e.g. /guides/. */
  readonly spa: boolean;
  readonly adminOnly?: boolean;
  /** Drawer: insert a divider row before this item. */
  readonly dividerBefore?: boolean;
}

export const SITE_NAV_ITEMS: readonly SiteNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'mdi-home',
    spa: true
  },
  {
    id: 'calculator',
    label: 'Calculator',
    path: '/calculator',
    icon: 'mdi-calculator',
    spa: true
  },
  {
    id: 'compare',
    label: 'Compare',
    path: '/compare',
    icon: 'mdi-compare-horizontal',
    spa: true
  },
  {
    id: 'tierlist',
    label: 'Tier lists',
    path: '/tierlist',
    icon: 'mdi-podium',
    spa: true
  },
  {
    id: 'recipes',
    label: 'Recipes',
    path: '/recipes',
    icon: 'mdi-food',
    spa: true
  },
  {
    id: 'guides',
    label: 'Guides',
    path: '/guides/',
    icon: 'mdi-book-open-variant-outline',
    spa: false
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'mdi-cog',
    spa: true,
    dividerBefore: true
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: 'mdi-shield-account',
    spa: true,
    adminOnly: true
  }
];

export function siteNavItemsForFrontend(isAdmin: boolean): readonly SiteNavItem[] {
  return SITE_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
}

export function siteNavItemsForGuides(): readonly SiteNavItem[] {
  return SITE_NAV_ITEMS.filter((item) => !item.adminOnly);
}
