<template>
  <div class="page-container">
    <TableCard title="班级学生" :loading="loading">
      <template #search>
        <div class="search-area">
          <SearchForm
            :fields="searchFields"
            :model="queryParams"
            @search="handleSearch"
            @reset="handleReset"
          />
          <div class="search-hint">当前页面为教师所有课程的学生汇总</div>
        </div>
      </template>

      <el-empty v-if="!loading && displayList.length === 0" description="暂无学生数据" />
      <template v-else>
        <el-table :data="displayList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="studentNo" label="学号" width="140" />
          <el-table-column prop="realName" label="学生姓名" min-width="120" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column label="所选课程" min-width="220">
            <template #default="{ row }">
              <el-tag
                v-for="course in (row.courses || [])"
                :key="course.id || course.courseId"
                style="margin: 2px 4px 2px 0"
                size="small"
              >
                {{ course.courseName }}
              </el-tag>
              <span v-if="!row.courses || row.courses.length === 0" class="no-data">暂无</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="filteredTotal"
            layout="total, sizes, prev, pager, next"
            @size-change="onPageChange"
            @current-change="onPageChange"
          />
        </div>
      </template>
    </TableCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCoursePage, getCourseStudents } from '@/api/course'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const loading = ref(false)
const allStudents = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

const queryParams = reactive({
  keyword: ''
})

const searchFields = [
  { prop: 'keyword', label: '学生姓名/学号', type: 'input', placeholder: '搜索学生姓名或学号' }
]

// 前端搜索过滤
const filteredTotal = computed(() => filteredStudents.value.length)

const filteredStudents = computed(() => {
  const keyword = (queryParams.keyword || '').trim().toLowerCase()
  if (!keyword) return allStudents.value
  return allStudents.value.filter(s =>
    (s.realName || '').toLowerCase().includes(keyword) ||
    (s.studentNo || '').toLowerCase().includes(keyword)
  )
})

// 前端分页
const displayList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStudents.value.slice(start, start + pageSize.value)
})

const loadStudents = async () => {
  loading.value = true
  try {
    // 获取当前教师的课程
    const courseRes = await getCoursePage({
      pageNum: 1,
      pageSize: 999,
      teacherId: userStore.userInfo?.id
    })
    const courses = courseRes.data?.records || courseRes.data || []

    if (courses.length === 0) {
      allStudents.value = []
      return
    }

    // 并行查询每门课的学生
    const studentResults = await Promise.all(
      courses.map(course =>
        getCourseStudents(course.id, { pageNum: 1, pageSize: 999 })
          .then(res => ({
            courseName: course.courseName,
            students: res.data?.records || res.data || []
          }))
          .catch(() => ({ courseName: course.courseName, students: [] }))
      )
    )

    // 合并去重
    const merged = new Map()
    for (const { courseName, students } of studentResults) {
      for (const student of students) {
        const key = student.id || student.userId || student.studentNo
        if (merged.has(key)) {
          const existing = merged.get(key)
          if (!existing.courses.find(c => c.courseName === courseName)) {
            existing.courses.push({ courseName })
          }
        } else {
          merged.set(key, {
            id: student.id,
            userId: student.userId,
            studentNo: student.studentNo || '',
            realName: student.realName || student.username || '',
            username: student.username || '',
            courses: [{ courseName }]
          })
        }
      }
    }

    allStudents.value = Array.from(merged.values())
    currentPage.value = 1
  } catch (e) {
    ElMessage.error(e.message || '获取学生列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = (params) => {
  queryParams.keyword = params.keyword || ''
  currentPage.value = 1
}

const handleReset = () => {
  queryParams.keyword = ''
  currentPage.value = 1
}

const onPageChange = () => {
  // displayList is computed, no data fetching needed
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.search-area {
  position: relative;
}

.search-hint {
  font-size: 12px;
  color: #909399;
  padding: 4px 0 8px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 0;
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
