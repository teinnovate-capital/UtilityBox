/* src/router/index.ts */

import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useUserStore } from '@/stores/user'
import TabsPage from '../views/TabsPage.vue'
import Home from '../views/Home.vue'
import Usage from '../views/Usage.vue'
import Rewards from '../views/Rewards.vue'

const routes = [
  {
    path: '/',
    redirect: '/tabs/home', 
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home',
      },
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'usage',
        component: Usage,
      },
      {
        path: 'rewards',
        component: Rewards,
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.userId
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(to.path)
  
  if (!isLoggedIn && !isPublicRoute) {
    // User is not logged in and trying to access protected route
    console.log('🔒 Not logged in, redirecting to login')
    next('/login')
  } else if (isLoggedIn && to.path === '/login') {
    // User is logged in and trying to access login page
    console.log('✅ Already logged in, redirecting to home')
    next('/tabs/home')
  } else {
    // All good, proceed
    next()
  }
})

export default router
