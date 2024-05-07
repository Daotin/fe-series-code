<script setup>
import { ref, computed } from "vue";
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue";
import Count from "./components/Count.vue";
import { useStore } from "vuex";

const store = useStore();

const keepAliveList = computed(() => store.state.keepAliveList);
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
    <!-- <component :is="Component" v-if="!$route.meta.keepAlive" /> -->
  </router-view>
  <!-- <router-view></router-view> -->
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.page-content {
  background-color: #f5f5f5;
  padding: 20px;
}
</style>
