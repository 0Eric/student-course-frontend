<template>
  <div class="page-container">
    <!-- 概览统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon-wrapper" style="background: #ecf5ff">
            <el-icon :size="28" color="#409eff"><Reading /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalCourses || 0 }}</div>
            <div class="stat-label">总课程数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon-wrapper" style="background: #f0f9eb">
            <el-icon :size="28" color="#67c23a"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalStudents || 0 }}</div>
            <div class="stat-label">总学生数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon-wrapper" style="background: #fdf6ec">
            <el-icon :size="28" color="#e6a23c"><Tickets /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalEnrollments || 0 }}</div>
            <div class="stat-label">总选课数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon-wrapper" style="background: #fef0f0">
            <el-icon :size="28" color="#f56c6c"><DataBoard /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.avgPerCourse || '0.0' }}</div>
            <div class="stat-label">平均每课人数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程选课详情 -->
    <TableCard title="课程选课明细" :loading="loading">
      <el-empty v-if="!loading && courseStats.length === 0" description="暂无选课数据" />
      <template v-else>
        <el-table :data="courseStats" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="courseName" label="课程名称" min-width="180" />
          <el-table-column prop="enrolledCount" label="已选人数" width="100" align="center" />
          <el-table-column prop="capacity" label="容量" width="80" align="center" />
          <el-table-column label="饱和度" min-width="160">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-progress
                  :percentage="fillPercent(row)"
                  :status="fillPercent(row) >= 100 ? 'exception' : fillPercent(row) >= 80 ? 'warning' : 'success'"
                  :stroke-width="12"
                  style="flex: 1"
                />
                <span style="font-size: 13px; color: #606266; width: 48px; text-align: right">
                  {{ fillPercent(row) }}%
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </TableCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Reading, User, Tickets, DataBoard } from '@element-plus/icons-vue'
import { getEnrollmentStats } from '@/api/statistics'

const loading = ref(false)
const overview = ref({})
const courseStats = ref([])

const fillPercent = (row) => {
  if (!row.capacity) return 0
  return Math.min(100, Math.round(((row.enrolledCount || 0) / row.capacity) * 100))
}

const loadStats = async () => {
  loading.value = true
  try {
    const res = await getEnrollmentStats()
    const data = res.data || res || {}
    overview.value = {
      totalCourses: data.totalCourses || 0,
      totalStudents: data.totalStudents || 0,
      totalEnrollments: data.totalEnrollments || 0,
      avgPerCourse: data.avgPerCourse || '0.0'
    }
    courseStats.value = data.courseStats || data.courseList || data.details || []
  } catch (e) {
    ElMessage.error(e.message || '获取选课统计失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.stat-card {
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 16px;
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  margin-left: 16px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
</style>
