<template>
  <div>
    <div>store count: {{ count }}</div>
    <div>组件count: {{ compCount }}</div>
    <el-button type="primary" @click="add">点击累加</el-button>
  </div>
</template>

<script setup>
import { ref, computed, onRenderTracked, onRenderTriggered } from "vue";
// import { useStore } from "../store/gvuex";
import { useStore } from "vuex";
let store = useStore();
let count = computed(() => store.state.count);

let compCount = ref(1);

function add() {
  store.commit("add");
  compCount.value++;
}

// onRenderTracked((e) => {
//   debugger;
// });

// onRenderTriggered((e) => {
//   debugger;
// });
</script>
