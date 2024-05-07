import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TaskDetail from '../views/TaskDetail.vue';
Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/task/:taskId',
    name: 'TaskDetail',
    component: TaskDetail,
    props: route => ({ taskName: route.query.taskName })
  }
]

const router = new VueRouter({
  routes
})

export default router
