<template>
  <div class="page-container">
    <TableCard title="班级选课情况" :loading="loading">
      <template #search>
        <SearchForm
          :fields="searchFields"
          :model="queryParams"
          @search="handleSearch"
          @reset="handleReset"
        >
          <template #actions>
            <el-select
              v-model="selectedCourseId"
              clearable
              placeholder="按课程筛选"
              style="width: 200px; margin-left: 8px"
              @change="handleCourseFilter"
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

      <el-empty v-if="!loading && enrollmentList.length === 0" description="暂无选课数据" />
      <template v-else>
        <el-table :data="enrollmentList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="realName" label="学生姓名" min-width="120" />
          <el-table-column prop="studentNo" label="学号" width="140" />
          <el-table-column label="已选课程" min-width="200">
            <template #default="{ row }">
              <el-tag
                v-for="course in (row.courses || row.enrolledCourses || [])"
                :key="course.id || course.courseId"
                style="margin: 2px 4px 2px 0"
                size="small"
              >
                {{ course.courseName }}
              </el-tag>
              <span v-if="!row.courses && !row.enrolledCourses" class="no-data">暂无</span>
            </template>
          </el-table-column>
          <el-table-column label="已选数量" width="100" align="center">
            <template #default="{ row }">
              {{ (row.courses || row.enrolledCourses || []).length }}
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
            @size-change="loadData"
            @current-change="loadData"
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
import { getClassEnrollmentStats } from '@/api/enrollment'
import { getCoursePage } from '@/api/course'

const userStore = useUserStore()

const loading = ref(false)
const enrollmentList = ref([])
const total = ref(0)
const classId = ref(null)
const selectedCourseId = ref(null)
const courseOptions = ref([])

const queryParams = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10
})

const searchFields = [
  { prop: 'keyword', label: '学生姓名', type: 'input', placeholder: '搜索学生姓名' }
]

const loadData = async () => {
  loading.value = true
  try {
    const cId = classId.value || userStore.userInfo?.classId
    if (!cId) {
      enrollmentList.value = []
      total.value = 0
      loading.value = false
      return
    }
    const params = { ...queryParams }
    if (selectedCourseId.value) {
      params.courseId = selectedCourseId.value
    }
    const res = await getClassEnrollmentStats({ ...params, classId: cId })
    enrollmentList.value = res.data?.records || res.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error(e.message || '获取选课情况失败')
  } finally {
    loading.value = false
  }
}

const loadCourseOptions = async () => {
  try {
    const res = await getCoursePage({ pageNum: 1, pageSize: 999 })
    courseOptions.value = res.data?.records || res.data || []
  } catch {
    // silently fail
  }
}

const handleSearch = (params) => {
  queryParams.keyword = params.keyword || ''
  queryParams.pageNum = 1
  loadData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.pageNum = 1
  selectedCourseId.value = null
  loadData()
}

const handleCourseFilter = () => {
  queryParams.pageNum = 1
  loadData()
}

onMounted(() => {
  classId.value = userStore.userInfo?.classId
  loadCourseOptions()
  loadData()
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
