import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: import('../views/Home.vue'),
    },
    {
      path: "/login",
      name: "Login",
      component: import('../views/Login.vue'),
    },
    {
      path: '/sign_up',
      name: 'SignUp',
      component: () => import('../views/SignUp.vue')
    },
  ],
});

export default router;