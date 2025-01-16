import HomePage from '@/pages/home-page.vue'

import { createRouter, createWebHistory } from 'vue-router'

export enum RouteName {
  Home = 'Home',
  Calculator = 'Calculator',
  Compare = 'Compare',
  Settings = 'Settings',
  Profile = 'Profile',
  UserSettings = 'UserSettings',
  Beta = 'Beta',
  Admin = 'Admin',
  NotFound = 'NotFound'
}

const CalculatorPage = () => import('@/pages/calculator-page.vue')
const ComparisonPage = () => import('@/pages/compare/comparison-page.vue')
const SettingsPage = () => import('@/pages/settings/settings-page.vue')
const ProfilePage = () => import('@/pages/profile-page.vue')
const UserSettingsPage = () => import('@/pages/user-settings-page.vue')
const BetaPage = () => import('@/pages/beta/beta.vue')
const AdminPage = () => import('@/pages/admin/admin.vue')
const NotFoundPage = () => import('@/pages/not-found/not-found-page.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteName.Home,
      component: HomePage
    },
    {
      path: '/calculator',
      name: RouteName.Calculator,
      component: CalculatorPage
    },
    {
      path: '/compare',
      name: RouteName.Compare,
      component: ComparisonPage
    },
    {
      path: '/settings',
      name: RouteName.Settings,
      component: SettingsPage
    },
    {
      path: '/profile',
      name: RouteName.Profile,
      component: ProfilePage
    },
    {
      path: '/user-settings',
      name: RouteName.UserSettings,
      component: UserSettingsPage
    },
    {
      path: '/beta',
      name: RouteName.Beta,
      component: BetaPage
    },
    {
      path: '/admin',
      name: RouteName.Admin,
      component: AdminPage,
      meta: { requiresAdmin: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteName.NotFound,
      component: NotFoundPage
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAdmin) {
    const { AdminService } = await import('@/services/admin/admin-service')
    const { useUserStore } = await import('@/stores/user-store')
    const { Roles } = await import('sleepapi-common')

    const userStore = useUserStore()
    if (userStore.role !== Roles.Admin) {
      next({ name: RouteName.Home })
    } else {
      await AdminService.verifyAdmin()
      next()
    }
  } else {
    next()
  }
})

export default router
