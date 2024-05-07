<template>
  <component :is="comp"></component>
</template>
<script setup>
import { computed } from "vue";
import { useRouter } from "./index";

let router = useRouter();

// 匹配 current 地址对应的组件，然后动态渲染到 router-view。
const comp = computed(() => {
  const route = router.routes.find(
    (route) => route.path === router.current.value
  );
  return route ? route.component : null;
});
</script>
