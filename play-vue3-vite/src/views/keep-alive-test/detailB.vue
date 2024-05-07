<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
});

const detailCount = ref(0);

function back() {
  router.back();
}
</script>
<script>
export default {
  name: "keep-alive-detail-b",
};
</script>
<template>
  <div>
    <el-button type="primary" @click="back">返回A</el-button>
    <div>id = {{ props.id }}</div>

    <el-input-number v-model="detailCount"></el-input-number>
  </div>
</template>
<style lang="less" scoped></style>
