<script lang="ts" setup>
import { computed } from "vue";
import Header from "./Header.vue";
import { useStore } from "vuex";

const store = useStore();

const keepAliveList = computed(() => store.state.keepAliveList);
</script>
<template>
  <el-container>
    <el-header>
      <Header />
    </el-header>
    <el-main>
      <!-- <router-view></router-view> -->
      <router-view v-slot="{ Component }">
        <keep-alive :include="keepAliveList">
          <component :is="Component" />
        </keep-alive>
        <!-- <component :is="Component" v-if="!$route.meta.keepAlive" /> -->
      </router-view>
    </el-main>
  </el-container>
</template>
<style lang="less" scoped>
.el-header {
  background-color: #fff;
}
.el-main {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
}
</style>
