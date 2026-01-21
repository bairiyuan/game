// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('../views/game/GameView.vue'),
    props: (route: any) => ({ query: route.query })
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router