import { inject, ref } from "vue";
import RouterLink from "./RouterLink.vue";
import RouterView from "./RouterView.vue";

const ROUTER_KEY = "__router__";

function createRouter(options) {
  return new Router(options);
}

function useRouter() {
  return inject(ROUTER_KEY);
}

function createWebHashHistory() {
  // 注册hashchange事件
  function bindEvent(fn) {
    window.addEventListener("hashchange", fn);
  }
  return {
    bindEvent,
    url: window.location.hash.slice(1) || "/",
  };
}

class Router {
  constructor(options) {
    this.history = options.history;
    this.routes = options.routes;
    // 保存当前路由
    this.current = ref(this.history.url);

    // 当hash改变，触发hashchange回调，会修改current值
    this.history.bindEvent(() => {
      this.current.value = window.location.hash.slice(1) || "/";
    });
  }

  install(app) {
    app.provide(ROUTER_KEY, this);
    // 注册全局组件
    app.component("router-link", RouterLink);
    app.component("router-view", RouterView);
  }
}

export { createRouter, createWebHashHistory, useRouter };
