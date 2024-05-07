import { createStore } from "vuex";
// import { createStore } from "./gvuex";

const store = createStore({
  state() {
    return {
      count: 666,
      keepAliveList: [],
    };
  },
  mutations: {
    add(state) {
      state.count++;
    },

    // 更新includes列表
    updateKeepAliveList(state, { type, name }) {
      if (type === "add") {
        if (!state.keepAliveList.includes(name)) {
          state.keepAliveList.push(name);
        }
      }
      if (type === "delete") {
        const index = state.keepAliveList.findIndex((item) => item === name);
        if (index > -1) {
          state.keepAliveList.splice(index, 1);
        }
      }
      if (type === "clear") {
        state.keepAliveList = [];
      }
    },
  },
});

export default store;
