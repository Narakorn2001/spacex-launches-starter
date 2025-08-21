import { createRouter, createWebHistory } from 'vue-router'
import LaunchesView from '../views/LaunchesView.vue'

const routes = [
  { path: '/', redirect: '/launches/all' },
  { path: '/launches/:view(all|past|upcoming)', name: 'launches', component: LaunchesView, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router