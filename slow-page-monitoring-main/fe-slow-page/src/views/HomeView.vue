<template>
  <div>
    <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%">
      <el-table-column
          prop="id"
          label="任务ID"
          width="80">
      </el-table-column>
      <el-table-column
          prop="taskName"
          label="任务名称">
      </el-table-column>
      <el-table-column
          prop="createTime"
          :formatter="formatCreateDate"
          width="180"
          label="创建时间">
      </el-table-column>
      <el-table-column
          width="180"
          label="操作">
        <template v-slot="scope">
          <el-link type="primary" @click="showTask(scope.row.id, scope.row.taskName)">查看</el-link>
        </template>
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
interface Tasks {
  id: number;
  taskName: string;
  createTime: number;
}

export default Vue.extend({
  name: "Tasks",
  data() {
    return {
      tableData:[] as Tasks[],
      totalData:[] as Tasks[],
      currentPage:0,
      pageSize: PAGE_SIZE
    }
  },
  watch:{
    currentPage:{
      handler(value) {
        console.log('currentPage changed to:' + value,this.totalData.length);
        this.resetData();
      }
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    resetData() {
      this.tableData = this.totalData.slice(PAGE_SIZE* (this.currentPage-1) , PAGE_SIZE * this.currentPage);
      console.log('tableData len='+ this.tableData.length);
    },
    formatCreateDate(row:{createTime: number}) {
      const date = new Date(row.createTime);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    loadData(){
      fetch('/api/slow-page/tasks')
          .then(response => response.json())
          .then(data => {
            this.totalData = data.data;
            if(this.totalData.length>0) {
              this.resetData();
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
    },
    handleSizeChange() {
      console.log('handleSizeChange');
    },
    showTask(id: string, taskName: string) {
      this.$router.push({
        path:'/task/' + id,
        query: {
          taskName
        }
      })
    }
  }
});
</script>

<style scoped>

</style>