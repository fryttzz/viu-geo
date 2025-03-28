import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'

import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: [
      {
         path: '/',
         name: 'Início',
         component: Home,
         meta: { requiresAuth: true }
      },
      {
         path: '/login',
         name: 'Login',
         component: Login,
      }
   ],
})

let isAuthReady = false;

const waitForAuth = new Promise((resolve) => {
   onAuthStateChanged(auth, (user) => {
      isAuthReady = true;
      resolve(user);
   });
});

router.beforeEach(async (to, from, next) => {
   if (!isAuthReady) {
      const user = await waitForAuth;
      if (user && to.path === '/login') {
         next('/')
      } else if (to.meta.requiresAuth && !user) {
         next("/login");
      } else {
         next();
      }
   } else {
      const user = auth.currentUser;
      if (user && to.path === '/login') {
         next("/")
      }
      else if (to.meta.requiresAuth && !user) {
         next("/login");
      } else {
         next();
      }
   }
});

export default router
