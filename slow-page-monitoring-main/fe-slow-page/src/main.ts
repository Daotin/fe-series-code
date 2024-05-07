import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Button, Select, Table, TableColumn, Loading, Message, Pagination, Link, Breadcrumb, BreadcrumbItem } from 'element-ui';

Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Pagination);
Vue.use(Link);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.component(Button.name, Button);
Vue.component(Select.name, Select);

Vue.use(Loading.directive);
Vue.prototype.$loading = Loading.service;
Vue.prototype.$message = Message;


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
