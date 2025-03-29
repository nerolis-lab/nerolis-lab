import HomePage from '@/pages/home-page.vue'
import { AuthProvider } from 'sleepapi-common'

import { createRouter, createWebHistory } from 'vue-router'

export enum RouteName {
  Home = 'Home',

  Calculator = 'Calculator',
  Compare = 'Compare',
  Recipes = 'Recipes',

  Settings = 'Settings',
  Profile = 'Profile',
  // Friends = 'Friends',

  Beta = 'Beta',

  Admin = 'Admin',

  Discord = 'Discord',

  NotFound = 'NotFound'
}

const CalculatorPage = () => import('@/pages/calculator-page.vue')
const ComparisonPage = () => import('@/pages/compare/comparison-page.vue')
const RecipesPage = () => import('@/pages/recipe/recipes-page.vue')

// User
const SettingsPage = () => import('@/pages/settings/settings-page.vue')
const ProfilePage = () => import('@/pages/profile-page.vue')
// const FriendsPage = () => import('@/pages/friends/friends-page.vue')

// Misc
const BetaPage = () => import('@/pages/beta/beta.vue')

// Admin
const AdminPage = () => import('@/pages/admin/admin.vue')

// 404
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
      path: '/recipes',
      name: RouteName.Recipes,
      component: RecipesPage
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
    // {
    //   path: '/friends',
    //   name: RouteName.Friends,
    //   component: FriendsPage
    // },
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
      path: '/discord',
      name: RouteName.Discord,
      component: HomePage
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteName.NotFound,
      component: NotFoundPage
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  // TODO: break out to a service
  // Handle Discord OAuth callback
  if (to.path === '/discord' || to.name === RouteName.Discord) {
    try {
      // Get the code from URL
      const code = to.query.code as string
      const error = to.query.error as string

      if (error) {
        logger.error(`Discord authentication error: ${error}`)
        next({ name: RouteName.Home })
        return
      }

      if (!code) {
        logger.error('No authorization code provided')
        next({ name: RouteName.Home })
        return
      }

      // Import userStore and login
      const { useUserStore } = await import('@/stores/user-store')
      const userStore = useUserStore()

      // Use the same redirectUri that was used for the initial request
      const redirectUri = `${window.location.origin}/discord`

      // Login with Discord
      await userStore.login(code, AuthProvider.Discord, redirectUri)

      // Continue to home page
      next({ name: RouteName.Home })
    } catch (error) {
      logger.error(`Discord login failed: ${error instanceof Error ? error.message : String(error)}`)
      next({ name: RouteName.Home })
    }
    return
  }

  // Handle admin routes
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
