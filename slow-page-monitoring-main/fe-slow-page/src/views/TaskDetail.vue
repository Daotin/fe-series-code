<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" style="margin: 20px 0px">
      <el-breadcrumb-item :to="{ path: '/' }">任务列表</el-breadcrumb-item>
      <el-breadcrumb-item>{{ taskName }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-table
        v-loading="false"
        :data="tableData"
        :row-class-name="tableRowClassName"
        border
        stripe
        style="width: 100%">
      <el-table-column
          prop="id"
          label="ID"
          width="80">
      </el-table-column>
      <el-table-column
          prop="route"
          label="页面路由"
          width="320">
        <template v-slot="scope">
          <el-link type="primary" :href="scope.row.routeUrl">{{scope.row.route}}</el-link>
        </template>
      </el-table-column>
      <el-table-column
          prop="type"
          :formatter="formatType"
          label="事件类型"
          width="120">
      </el-table-column>
      <el-table-column
          prop="useTime"
          label="用时(ms)"
          width="120">
      </el-table-column>
      <el-table-column
          prop="url"
          label="url">
      </el-table-column>
      <el-table-column
          prop="detail"
          label="控件/错误"
          :formatter="formatDetail"
          width="200">
      </el-table-column>
      <el-table-column
          prop="createTime"
          :formatter="formatCreateDate"
          label="事件时间"
          width="160">
      </el-table-column>
    </el-table>
    <div style="height:20px" />
    <el-pagination
        background
        @size-change="handleSizeChange"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="this.totalData.length">
    </el-pagination>
  </div>
</template>

<script lang="ts">
import Vue, {PropType} from 'vue';
const PAGE_SIZE  = 10;

export interface Record {
  id: number;
  route: string;
  routeUrl: string;
  title: string;
  type: 'page_load_time' | 'click_load_time' | 'network_load_time';
  createTime: number;
  url?: string;
  params?: string;
  detail?: string;
  useTime?: string;
  taskName: string;
}

export default Vue.extend({
  name: "Tasks",
  props: {
    taskName: String
  },
  data() {
    return {
      tableData:[] as Record[],
      totalData:[] as Record[],
      currentPage:0,
      pageSize: PAGE_SIZE,
      isLoading: false
    }
  },
  watch:{
    currentPage:{
      handler(value) {
        this.resetData();
      }
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    tableRowClassName(callback: {row: Record}) {
      console.log('tableRowClassName:', callback);
      if (callback.row.type ==='network_load_time' && callback.row.detail) {
        console.log('应该是警告');
        return 'warning-row';
      }
      return '';
    },
    resetData() {
      this.tableData = this.totalData.slice(PAGE_SIZE* (this.currentPage-1) , PAGE_SIZE * this.currentPage);
    },
    formatDetail(row:Record) {
      const title = row.title ? '页面标题:' + row.title : '';
      return title + ', ' + row.detail;
    },
    formatCreateDate(row:{createTime: number}) {
      const date = new Date(row.createTime);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    formatType(row: Record) {
      if(row.type==='page_load_time') {
        return '页面加载时间';
      } else if(row.type=='click_load_time') {
        return '点击响应时间';
      } else if(row.type === 'network_load_time') {
        return '接口响应时间'
      } else {
        return '未知'
      }
    },
    loadData(){
      const loading = this.$loading({
        lock: true,//lock的修改符--默认是false
        text: 'Loading',//显示在加载图标下方的加载文案
        spinner: 'el-icon-loading',//自定义加载图标类名
        background: 'rgba(0, 0, 0, 0.5)',//遮罩层颜色
        target: document.querySelector('.el-table') as any//loadin覆盖的dom元素节点
      });
      fetch('/api/slow-page/records',{
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: this.$route.params.taskId
        }),
      })
      .then(response => response.json())
      .then(data => {
        this.totalData = data.data;
        if(this.totalData.length>0) {
          this.resetData();
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      }).finally(()=>{
        //成功回调函数停止加载
        loading.close();
      });
    },
    handleSizeChange() {
      console.log('handleSizeChange');
    }
  }
});
</script>

<style scoped>

</style>

<style>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>