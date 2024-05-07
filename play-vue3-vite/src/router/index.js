import { createRouter, createWebHashHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css"; //样式必须引入
// import { createRouter, createWebHashHistory } from "./grouter";

// import Home from "@/views/Home.vue";
// import About from "../views/About.vue";
// import Count from "../components/Count.vue";
// import Render from "../components/render.vue";
// import Render from "../components/render.jsx";

import commonRoute from "./modules/common";
import keepAliveRoute from "./modules/keep-alive";

import store from "@/store";

const routes = [
  {
    path: "/",
    redirect: "/platform",
  },
  {
    path: "/platform",
    name: "platform",
    component: () => import("@/layout/index.vue"),
    redirect: "/home",
    children: [...commonRoute, ...keepAliveRoute],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式
  routes,
});

router.beforeEach((to, from) => {
  NProgress.start();
  const title = (to.meta && to.meta.title) || "";
  if (title) {
    document.title = title;
  }

  console.log("⭐to==>", to);

  if (to.name && to.meta.keepAlive) {
    store.commit("updateKeepAliveList", {
      type: "add",
      name: to.name,
    });
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
