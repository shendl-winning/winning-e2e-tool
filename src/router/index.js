import { createRouter,createWebHashHistory } from "vue-router";
import Home from '@/views/Home.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path:'/',
            name:Home,
            component:Home
        }
    ],
    scrollBehavior: () => ({ top: 0, left: 0 }),
    linkActiveClass: 'active',
    linkExactActiveClass: 'exact-active',
    parseQuery: null,
    stringifyQuery: null,
    fallback: true
  });

  export default router