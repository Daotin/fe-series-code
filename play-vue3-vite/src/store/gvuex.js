import { provide, inject, reactive } from "vue";

const STORE_KEY = "__store__";

class Store {
  constructor(options) {
    this._state = reactive({
      data: options.state(),
    });
    this._mutations = options.mutations;
  }
  get state() {
    return this._state.data;
  }
  commit = (type, payload) => {
    const func = this._mutations[type];
    func && func(this.state, payload);
  };
  install(app) {
    app.provide(STORE_KEY, this);
  }
}

function createStore(options) {
  return new Store(options);
}

function useStore() {
  return inject(STORE_KEY);
}

export { createStore, useStore };
