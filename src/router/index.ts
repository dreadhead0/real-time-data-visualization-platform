import { createRouter, createWebHistory } from 'vue-router'

const LandingView = () => import('@/views/LandingView.vue')
const LoginView = () => import('@/views/auth/LoginView.vue')
const SignupView = () => import('@/views/auth/SignupView.vue')
const DashboardLayout = () => import('@/layouts/DashboardLayout.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/app',
      component: DashboardLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
        },
      ],
    },
  ],
})

export default router