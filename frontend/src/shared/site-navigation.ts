export interface SiteNavItem {
  title: string;
  href: string;
  icon: string;
}

export const MAIN_SITE_NAV_ITEMS: SiteNavItem[] = [
  { title: 'Home', href: '/', icon: 'mdi-home' },
  { title: 'Calculator', href: '/calculator', icon: 'mdi-calculator' },
  { title: 'Compare', href: '/compare', icon: 'mdi-compare-horizontal' },
  { title: 'Tier lists', href: '/tierlist', icon: 'mdi-podium' },
  { title: 'Recipes', href: '/recipes', icon: 'mdi-food' },
  { title: 'Guides', href: '/guides/', icon: 'mdi-book-open-page-variant' }
];
