import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
    { path: '/inbox', name: 'Inbox', component: () => import('../views/Inbox.vue'), meta: { requiresAuth: true } },
    { path: '/mail/:id', name: 'MailDetail', component: () => import('../views/MailDetail.vue'), meta: { requiresAuth: true } },
    { path: '/compose', name: 'Compose', component: () => import('../views/Compose.vue'), meta: { requiresAuth: true } },
    { path: '/settings', name: 'Settings', component: () => import('../views/Settings.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('jmap_basic')
  if (to.meta.requiresAuth && !token) next('/login')
  else next()
})

export default router
