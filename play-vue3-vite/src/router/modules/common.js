const route = [
  { path: "/home", component: () => import("@/views/Home.vue") },
  { path: "/about", component: () => import("@/views/About.vue") },
  { path: "/count", component: () => import("@/components/Count.vue") },
  { path: "/render", component: () => import("@/components/render.jsx") },
];

export default route;
