import { createRouter, createWebHashHistory } from "vue-router";
// import { createRouter, createWebHashHistory } from "./grouter";

// import Home from "../views/Home.vue";
import About from "@/views/About.vue";
import Count from "../components/Count.vue";
import Render from "../components/render.vue";

const Home = () => import("@/views/Home.vue");

const routes = [
  { name: "home", path: "/", component: () => import("@/views/Home.vue") },
  {
    name: "about",
    path: "/about",
    component: () => import("@/views/About.vue"),
  },
  {
    name: "count",
    path: "/count",
    component: () => import("@/components/Count.vue"),
  },
  {
    name: "render",
    path: "/render",
    component: () => import("@/components/render.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式
  routes,
});

export default router;
