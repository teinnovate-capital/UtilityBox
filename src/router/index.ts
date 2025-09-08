import { createRouter, createWebHistory } from '@ionic/vue-router'
import TabsPage from '../views/TabsPage.vue'
import Home from '../views/Home.vue'
import Usage from '../views/Usage.vue'
import Rewards from '../views/Rewards.vue'

const routes = [
  {
    path: '/',
    redirect: '/Login',
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

export default router
