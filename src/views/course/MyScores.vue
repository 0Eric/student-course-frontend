<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.totalCourses }}</div>
          <div class="stat-label">总课程数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value success-color">{{ stats.passedCourses }}</div>
          <div class="stat-label">已通过</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value primary-color">{{ stats.averageScore }}</div>
          <div class="stat-label">平均分</div>
        </el-card>
      </el-col>
    </el-row>

    <TableCard title="我的成绩" :loading="loading">
      <template #search>
        <SearchForm
          :fields="searchFields"
          :model="queryParams"
          @search="handleSearch"
          @reset="handleReset"
        />
      </template>

      <el-empty v-if="!loading && scoreList.length === 0" description="暂无成绩记录" />
      <template v-else>
        <el-table :data="scoreList" stripe style="width: 100%">
          <el-table-column prop="courseName" label="课程名称" min-width="160" />
          <el-table-column prop="teacherName" label="教师" min-width="120" />
          <el-table-column prop="credits" label="学分" width="80" align="center" />
          <el-table-column prop="score" label="成绩" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.score !== null && row.score !== undefined" :type="row.score >= 60 ? 'success' : 'danger'" size="large">
                {{ row.score }}
              </el-tag>
              <span v-else class="no-score">--</span>
            </template>
          </el-table-column>
          <el-table-column label="是否及格" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.score !== null && row.score !== undefined" :type="row.score >= 60 ? 'success' : 'danger'" size="small">
                {{ row.score >= 60 ? '及格' : '不及格' }}
              </el-tag>
              <span v-else class="no-score">--</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyScores } from '@/api/score'

const loading = ref(false)
const scoreList = ref([])
const total = ref(0)

const queryParams = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10
})

const searchFields = [
  { prop: 'keyword', label: '课程名称', type: 'input', placeholder: '搜索课程名称' }
]

const stats = computed(() => {
  const list = scoreList.value
  const totalCourses = list.length
  const scoredCourses = list.filter(item => item.score !== null && item.score !== undefined)
  const passedCourses = scoredCourses.filter(item => item.score >= 60).length
  const totalScore = scoredCourses.reduce((sum, item) => sum + item.score, 0)
  const averageScore = scoredCourses.length > 0 ? (totalScore / scoredCourses.length).toFixed(1) : '0.0'
  return {
    totalCourses,
    passedCourses,
    averageScore
  }
})

const loadScores = async () => {
  loading.value = true
  try {
    const res = await getMyScores({ ...queryParams })
    scoreList.value = res.data?.records || res.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error(e.message || '获取成绩失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = (params) => {
  queryParams.keyword = params.keyword || ''
  queryParams.pageNum = 1
  loadScores()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.pageNum = 1
  loadScores()
}

onMounted(() => {
  loadScores()
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

.success-color {
  color: #67c23a;
}

.primary-color {
  color: #409eff;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.no-score {
  color: #909399;
}
</style>
