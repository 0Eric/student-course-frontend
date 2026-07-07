<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px" v-if="stats">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value primary-color">{{ stats.avgScore || '--' }}</div>
          <div class="stat-label">班级平均分</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value success-color">{{ stats.maxScore || '--' }}</div>
          <div class="stat-label">最高分</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value" style="color: #e6a23c">{{ stats.minScore || '--' }}</div>
          <div class="stat-label">最低分</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value" style="color: #67c23a">{{ stats.passRate || '--' }}</div>
          <div class="stat-label">及格率</div>
        </el-card>
      </el-col>
    </el-row>

    <TableCard title="班级成绩" :loading="loading">
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

      <el-empty v-if="!loading && scoreList.length === 0" description="暂无成绩数据" />
      <template v-else>
        <el-table :data="scoreList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="realName" label="学生姓名" min-width="120" />
          <el-table-column prop="studentNo" label="学号" width="140" />
          <el-table-column prop="courseName" label="课程" min-width="160" />
          <el-table-column prop="score" label="成绩" width="100" align="center">
            <template #default="{ row }">
              <el-tag
                v-if="row.score !== null && row.score !== undefined"
                :type="row.score >= 60 ? 'success' : 'danger'"
                size="large"
              >
                {{ row.score }}
              </el-tag>
              <span v-else class="no-data">未录入</span>
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
import { getClassScoreStats } from '@/api/score'
import { getCoursePage } from '@/api/course'

const userStore = useUserStore()

const loading = ref(false)
const scoreList = ref([])
const total = ref(0)
const stats = ref(null)
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
      scoreList.value = []
      total.value = 0
      stats.value = null
      loading.value = false
      return
    }
    const params = { ...queryParams }
    if (selectedCourseId.value) {
      params.courseId = selectedCourseId.value
    }
    const res = await getClassScoreStats(cId, params)
    scoreList.value = res.data?.records || res.data?.scoreList || res.data || []
    total.value = res.data?.total || 0
    stats.value = res.data?.stats || {
      avgScore: '--',
      maxScore: '--',
      minScore: '--',
      passRate: '--'
    }
  } catch (e) {
    ElMessage.error(e.message || '获取班级成绩失败')
  } finally {
    loading.value = false
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

const loadCourseOptions = async () => {
  try {
    const res = await getCoursePage({ pageNum: 1, pageSize: 999 })
    courseOptions.value = res.data?.records || res.data || []
  } catch {
    // silently fail
  }
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

.stat-card {
  border-radius: 8px;
  text-align: center;
  padding: 8px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.primary-color {
  color: #409eff;
}

.success-color {
  color: #67c23a;
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
