import { createRouter,createWebHashHistory } from "vue-router";
import home from '@/views/Home.vue'
import left from '@/views/Left.vue'
import rightDefault from '@/views/RightDefault.vue'
import right from '@/views/Right.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {path:'/', redirect:"/kelp/index"},
        {
            path:'/kelp',
            component:home,
            children:[
                {
                    path: 'index',
                    components: {
                        leftView: left,
                        rightView: rightDefault
                    }
                }   
            ]
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