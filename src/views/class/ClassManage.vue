<template>
  <div class="page-container">
    <TableCard title="班级管理" :loading="loading">
      <template #search>
        <SearchForm
          :fields="searchFields"
          :model="queryParams"
          @search="handleSearch"
          @reset="handleReset"
        />
      </template>

      <el-empty v-if="!loading && studentList.length === 0" description="暂无班级成员" />
      <template v-else>
        <el-table :data="studentList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="studentNo" label="学号" width="140" />
          <el-table-column prop="realName" label="姓名" min-width="120" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next"
            @size-change="getClassStudents"
            @current-change="getClassStudents"
          />
        </div>
      </template>
    </TableCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getClassStudents as fetchClassStudents } from '@/api/classes'

const userStore = useUserStore()

const loading = ref(false)
const studentList = ref([])
const total = ref(0)
const classId = ref(null)

const queryParams = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10
})

const searchFields = [
  { prop: 'keyword', label: '姓名/学号', type: 'input', placeholder: '按姓名或学号搜索' }
]

const getClassStudents = async () => {
  loading.value = true
  try {
    const cId = classId.value || userStore.userInfo?.classId
    if (!cId) {
      studentList.value = []
      total.value = 0
      loading.value = false
      return
    }
    const res = await fetchClassStudents(cId, { ...queryParams })
    studentList.value = res.data?.records || res.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error(e.message || '获取班级成员失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = (params) => {
  queryParams.keyword = params.keyword || ''
  queryParams.pageNum = 1
  getClassStudents()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.pageNum = 1
  getClassStudents()
}

onMounted(() => {
  classId.value = userStore.userInfo?.classId
  getClassStudents()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>
