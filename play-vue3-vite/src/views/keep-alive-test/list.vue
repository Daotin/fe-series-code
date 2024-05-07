<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

let count = ref(1);

function jumpDetail() {
  router.push({ name: "keep-alive-detail", params: { id: count.value } });
}
</script>
<script>
export default {
  name: "keep-alive-list",
};
</script>
<template>
  <el-input-number v-model="count"></el-input-number>
  <el-button type="primary" @click="jumpDetail">跳转到A</el-button>
</template>
