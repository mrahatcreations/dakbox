import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/inbox' },
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
    { 
      path: '/', 
      component: () => import('../layouts/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: 'inbox', name: 'Inbox', component: () => import('../views/Inbox.vue') },
        { path: 'mail/:id', name: 'MailDetail', component: () => import('../views/MailDetail.vue') },
        { path: 'compose', name: 'Compose', component: () => import('../views/Compose.vue') },
        { path: 'settings', name: 'Settings', component: () => import('../views/Settings.vue') }
      ]
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('jmap_basic')
  if (to.meta.requiresAuth && !token) next('/login')
  else next()
})

export default router
