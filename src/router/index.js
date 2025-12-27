// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Terms from "@/views/Terms.vue";
import Privacy from "@/views/Privacy.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/terms", name: "terms", component: Terms },
  { path: "/privacy", name: "privacy", component: Privacy },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // ページ遷移時に先頭へ（UX）
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
