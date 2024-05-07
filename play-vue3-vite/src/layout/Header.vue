<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const activeIndex = ref("/home");

const store = useStore();
const route = useRoute();

const routes = [
  {
    name: "首页",
    link: "/home",
  },
  {
    name: "关于",
    link: "/about",
  },
  {
    name: "累加2",
    link: "/count",
  },
  {
    name: "render",
    link: "/render",
  },
  {
    name: "keep-alive",
    link: "/ka/list",
  },
];

function handleSelect() {
  console.log("⭐tab click==>");
  store.commit("updateKeepAliveList", {
    type: "clear",
  });
}

onMounted(() => {
  console.log("⭐route==>", route.fullPath);
  activeIndex.value = route.fullPath || "/home";
});
</script>
<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    router
    @select="handleSelect"
  >
    <el-menu-item :index="item.link" v-for="item in routes">
      {{ item.name }}
    </el-menu-item>
  </el-menu>
</template>
<style lang="less" scoped></style>
