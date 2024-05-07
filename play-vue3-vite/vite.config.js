import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import vueJsx from "@vitejs/plugin-vue-jsx"; // 配置vue使用jsx

import path from "path";
const resolve = (dir) => path.resolve(process.cwd(), dir);

export default defineConfig({
  define: {
    // __VUE_OPTIONS_API__: false,
  },
  plugins: [vue(), vueJsx()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {},
        additionalData: `@import "src/assets/styles/variable.less";`,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve("src"),
    },
    dedupe: ["vue"],
  },
  server: {
    hmr: true,
  },
});
