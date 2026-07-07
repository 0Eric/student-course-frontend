<template>
  <div class="page-container">
    <TableCard title="全校成绩" :loading="loading">
      <template #search>
        <SearchForm
          :fields="searchFields"
          :model="queryParams"
          @search="handleSearch"
          @reset="handleReset"
        >
          <template #actions>
            <el-select
              v-model="queryParams.classId"
              clearable
              placeholder="按班级筛选"
              style="width: 180px; margin-left: 8px"
              @change="handleFilterChange"
            >
              <el-option
                v-for="c in classOptions"
                :key="c.id"
                :label="c.className"
                :value="c.id"
              />
            </el-select>
            <el-select
              v-model="queryParams.courseId"
              clearable
              placeholder="按课程筛选"
              style="width: 180px; margin-left: 8px"
              @change="handleFilterChange"
            >
              <el-option
                v-for="c in courseOptions"
                :key="c.id"
                :label="c.courseName"
                :value="c.id"
              />
            </el-select>
          </template>
        </SearchForm>
      </template>

      <el-empty v-if="!loading && scoreList.length === 0" description="暂无成绩数据" />
      <template v-else>
        <el-table :data="scoreList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="studentNo" label="学号" width="130" />
          <el-table-column prop="realName" label="学生姓名" min-width="110" />
          <el-table-column prop="className" label="班级" min-width="120" />
          <el-table-column prop="courseName" label="课程" min-width="140" />
          <el-table-column prop="score" label="成绩" width="100" align="center">
            <template #default="{ row }">
              <el-tag
                v-if="row.score !== null && row.score !== undefined"
                :type="row.score >= 60 ? 'success' : 'danger'"
                size="large"
              >
                {{ row.score }}
              </el-tag>
              <span v-else class="no-data">--</span>
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
            @size-change="loadScores"
            @current-change="loadScores"
          />
        </div>
      </template>
    </TableCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSchoolScores } from '@/api/statistics'
import { getClassPage } from '@/api/classes'
import { getCoursePage } from '@/api/course'

const loading = ref(false)
const scoreList = ref([])
const total = ref(0)
const classOptions = ref([])
const courseOptions = ref([])

const queryParams = reactive({
  keyword: '',
  classId: '',
  courseId: '',
  pageNum: 1,
  pageSize: 10
})

const searchFields = [
  { prop: 'keyword', label: '学生姓名/学号', type: 'input', placeholder: '搜索学生姓名或学号' }
]

const loadScores = async () => {
  loading.value = true
  try {
    const params = { ...queryParams }
    // 清理空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    const res = await getSchoolScores(params)
    scoreList.value = res.data?.records || res.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error(e.message || '获取成绩数据失败')
  } finally {
    loading.value = false
  }
}

const loadFilterOptions = async () => {
  try {
    const [classRes, courseRes] = await Promise.all([
      getClassPage({ pageNum: 1, pageSize: 999 }),
      getCoursePage({ pageNum: 1, pageSize: 999 })
    ])
    classOptions.value = classRes.data?.records || classRes.data || []
    courseOptions.value = courseRes.data?.records || courseRes.data || []
  } catch {
    // silently fail
  }
}

const handleSearch = (params) => {
  queryParams.keyword = params.keyword || ''
  queryParams.pageNum = 1
  loadScores()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.classId = ''
  queryParams.courseId = ''
  queryParams.pageNum = 1
  loadScores()
}

const handleFilterChange = () => {
  queryParams.pageNum = 1
  loadScores()
}

onMounted(() => {
  loadFilterOptions()
  loadScores()
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

.no-data {
  color: #909399;
  font-size: 13px;
}
</style>
