<template>
  <div class="page-container">
    <!-- 班级选择 -->
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="选择班级">
          <el-select
            v-model="selectedClassId"
            placeholder="请选择班级"
            style="width: 260px"
            @change="handleClassChange"
          >
            <el-option
              v-for="c in classOptions"
              :key="c.id"
              :label="c.className"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程筛选">
          <el-select
            v-model="queryParams.courseId"
            clearable
            placeholder="全部课程"
            style="width: 200px"
            @change="loadReport"
          >
            <el-option
              v-for="c in courseOptions"
              :key="c.id"
              :label="c.courseName"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <template v-if="selectedClassId">
      <!-- 统计卡片 -->
      <el-row :gutter="16" style="margin-bottom: 16px">
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-value primary-color">{{ reportData.totalCount || '--' }}</div>
            <div class="stat-label">学生数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-value" style="color: #409eff">{{ reportData.avgScore || '--' }}</div>
            <div class="stat-label">平均分</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-value success-color">{{ reportData.maxScore || '--' }}</div>
            <div class="stat-label">最高分</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-value" style="color: #e6a23c">{{ reportData.minScore || '--' }}</div>
            <div class="stat-label">最低分</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 及格率 -->
      <el-row :gutter="16" style="margin-bottom: 16px">
        <el-col :span="24">
          <el-card shadow="never" class="stat-card">
            <div style="display: flex; align-items: center; justify-content: center; gap: 16px">
              <div>
                <div class="stat-value success-color">{{ reportData.passRate || '--' }}</div>
                <div class="stat-label">及格率</div>
              </div>
              <el-progress
                :percentage="reportData.passRate ? parseFloat(reportData.passRate) : 0"
                :stroke-width="16"
                style="width: 400px"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 成绩详情 -->
      <TableCard title="学生成绩详情" :loading="loading">
        <el-empty v-if="!loading && detailList.length === 0" description="暂无成绩数据" />
        <template v-else>
          <el-table :data="detailList" stripe style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="studentNo" label="学号" width="130" />
            <el-table-column prop="studentName" label="学生姓名" min-width="120" />
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
                <span v-else class="no-data">--</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="detailTotal"
              layout="total, sizes, prev, pager, next"
              @size-change="loadReport"
              @current-change="loadReport"
            />
          </div>
        </template>
      </TableCard>
    </template>
    <el-empty v-else-if="!loading" description="请先选择一个班级查看报表" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getClassPage } from '@/api/classes'
import { getCoursePage } from '@/api/course'
import { getClassScoreReport } from '@/api/statistics'

const loading = ref(false)
const selectedClassId = ref(null)
const classOptions = ref([])
const courseOptions = ref([])
const reportData = ref({})
const detailList = ref([])
const detailTotal = ref(0)

const queryParams = reactive({
  courseId: '',
  pageNum: 1,
  pageSize: 10
})

const loadClassOptions = async () => {
  try {
    const res = await getClassPage({ pageNum: 1, pageSize: 999 })
    classOptions.value = res.data?.records || res.data || []
  } catch {
    // silently fail
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

const loadReport = async () => {
  if (!selectedClassId.value) return
  loading.value = true
  try {
    const params = { ...queryParams }
    if (!params.courseId) delete params.courseId

    const res = await getClassScoreReport(selectedClassId.value, params)
    reportData.value = res.data?.stats || res.data || {}
    detailList.value = res.data?.records || res.data?.students || []
    detailTotal.value = res.data?.total || detailList.value.length
  } catch (e) {
    ElMessage.error(e.message || '获取班级报表失败')
  } finally {
    loading.value = false
  }
}

const handleClassChange = () => {
  queryParams.pageNum = 1
  loadReport()
}

onMounted(() => {
  loadClassOptions()
  loadCourseOptions()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.stat-card {
  border-radius: 8px;
  text-align: center;
  padding: 12px 0;
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
