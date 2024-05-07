<script setup>
import { ref } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
});

const detailCount = ref(0);

function back() {
  router.push({ name: "keep-alive-list" });
}

function jumpDetailB() {
  router.push({ name: "keep-alive-detail-b" });
}

onBeforeRouteLeave((to, from) => {
  if (to.name === "keep-alive-list") {
    store.commit("updateKeepAliveList", {
      type: "delete",
      name: "keep-alive-detail",
    });
  }
});
</script>
<script>
export default {
  name: "keep-alive-detail",
};
</script>
<template>
  <div>
    <el-button type="primary" @click="back">返回列表</el-button>
    <div>id = {{ props.id }}</div>

    <el-input-number v-model="detailCount"></el-input-number>

    <el-button type="primary" @click="jumpDetailB">跳转到B</el-button>
  </div>
</template>
<style lang="less" scoped></style>
