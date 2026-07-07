<template>
  <div class="home-container">
    <div v-loading="loading" class="home-content">
      <!-- 欢迎区域 -->
      <el-card shadow="never" class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-text">
            <h1 class="welcome-title">欢迎回来，{{ userStore.userInfo?.realName || userStore.userInfo?.username || '用户' }}</h1>
            <p class="welcome-desc">{{ roleDescription }}</p>
          </div>
          <div class="welcome-time">
            <p class="time-text">{{ currentTime }}</p>
            <p class="date-text">{{ currentDate }}</p>
          </div>
        </div>
      </el-card>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6" v-for="stat in statsCards" :key="stat.label">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">{{ stat.label }}</p>
                <p class="stat-value">{{ stat.value }}</p>
              </div>
              <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                <el-icon :size="28">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
      <el-card shadow="never" class="action-card">
        <template #header>
          <span class="section-title">快捷操作</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="6" v-for="action in quickActions" :key="action.label">
            <el-button
              :type="action.type"
              size="large"
              class="quick-action-btn"
              @click="action.handler"
            >
              <el-icon :size="18"><component :is="action.icon" /></el-icon>
              {{ action.label }}
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import dayjs from 'dayjs'
import { getDashboardStats } from '@/api/statistics'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const stats = ref(null)

const hasRole = (code) => userStore.roleCodes.includes(code)

const roleDescription = computed(() => {
  if (hasRole('PRINCIPAL')) return '校长管理面板 — 全面掌握学校运营数据'
  if (hasRole('TEACHER')) return '教师工作台 — 管理课程与成绩'
  if (hasRole('MONITOR')) return '班干部工作台 — 协助管理班级事务'
  if (hasRole('STUDENT')) return '学生学习中心 — 选课与成绩查询'
  return '欢迎使用学生课程管理系统'
})

// 时间
const currentTime = ref('')
const currentDate = ref('')
let timer = null

const updateTime = () => {
  const now = dayjs()
  currentTime.value = now.format('HH:mm:ss')
  currentDate.value = now.format('YYYY年MM月DD日 dddd')
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  fetchDashboardStats()
})

const fetchDashboardStats = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res.data
  } catch (e) {
    console.error('获取仪表盘统计失败', e)
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 统计卡片
const statsCards = computed(() => {
  if (hasRole('PRINCIPAL')) {
    return [
      { label: '总用户数', value: stats.value?.totalUsers ?? '--', icon: 'User', color: '#409eff' },
      { label: '课程总数', value: stats.value?.totalCourses ?? '--', icon: 'Reading', color: '#67c23a' },
      { label: '班级总数', value: stats.value?.totalClasses ?? '--', icon: 'School', color: '#e6a23c' },
      { label: '总选课数', value: stats.value?.totalEnrollments ?? '--', icon: 'List', color: '#f56c6c' }
    ]
  }
  if (hasRole('TEACHER')) {
    return [
      { label: '我的课程', value: stats.value?.myCourseCount ?? '--', icon: 'Reading', color: '#409eff' },
      { label: '学生总数', value: stats.value?.studentCount ?? '--', icon: 'UserFilled', color: '#67c23a' },
      { label: '授课班级', value: stats.value?.classCount ?? '--', icon: 'School', color: '#e6a23c' },
      { label: '待录入成绩', value: stats.value?.pendingScoreCount ?? '--', icon: 'Edit', color: '#f56c6c' }
    ]
  }
  if (hasRole('MONITOR')) {
    return [
      { label: '班级人数', value: stats.value?.classSize ?? '--', icon: 'UserFilled', color: '#409eff' },
      { label: '已选课程', value: stats.value?.enrolledCount ?? '--', icon: 'Notebook', color: '#67c23a' },
      { label: '可选课程', value: stats.value?.availableCount ?? '--', icon: 'Reading', color: '#e6a23c' },
      { label: '班级成绩', value: stats.value?.scoreCount ?? '--', icon: 'TrendCharts', color: '#f56c6c' }
    ]
  }
  // 学生默认
  return [
    { label: '已选课程', value: stats.value?.enrolledCount ?? '--', icon: 'Notebook', color: '#409eff' },
    { label: '可选课程', value: stats.value?.availableCount ?? '--', icon: 'Reading', color: '#67c23a' },
    { label: '我的成绩', value: stats.value?.scoreCount ?? '--', icon: 'DataAnalysis', color: '#e6a23c' },
    { label: '课程数', value: stats.value?.totalCourseCount ?? '--', icon: 'List', color: '#f56c6c' }
  ]
})

// 快捷操作
const quickActions = computed(() => {
  const actions = []
  if (hasRole('STUDENT') || hasRole('MONITOR')) {
    actions.push({
      label: '浏览课程',
      icon: 'Reading',
      type: 'primary',
      handler: () => router.push('/dashboard/courses')
    })
    actions.push({
      label: '我的课程',
      icon: 'Notebook',
      type: 'success',
      handler: () => router.push('/dashboard/my-courses')
    })
    actions.push({
      label: '成绩查询',
      icon: 'DataAnalysis',
      type: 'warning',
      handler: () => router.push('/dashboard/my-scores')
    })
  }
  if (hasRole('TEACHER')) {
    actions.push({
      label: '课程管理',
      icon: 'Reading',
      type: 'primary',
      handler: () => router.push('/dashboard/teacher/courses')
    })
    actions.push({
      label: '成绩录入',
      icon: 'Edit',
      type: 'success',
      handler: () => router.push('/dashboard/teacher/scores')
    })
    actions.push({
      label: '班级学生',
      icon: 'UserFilled',
      type: 'warning',
      handler: () => router.push('/dashboard/teacher/students')
    })
  }
  if (hasRole('PRINCIPAL')) {
    actions.push({
      label: '教师管理',
      icon: 'User',
      type: 'primary',
      handler: () => router.push('/dashboard/admin/teachers')
    })
    actions.push({
      label: '全校成绩',
      icon: 'DataAnalysis',
      type: 'success',
      handler: () => router.push('/dashboard/admin/scores')
    })
    actions.push({
      label: '选课统计',
      icon: 'PieChart',
      type: 'warning',
      handler: () => router.push('/dashboard/admin/enrollment-stats')
    })
  }
  actions.push({
    label: '个人中心',
    icon: 'Setting',
    type: 'info',
    handler: () => router.push('/dashboard/profile')
  })
  return actions
})
</script>

<style scoped>
.home-container {
  padding: 20px;
  min-height: 100%;
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.welcome-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.time-text {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  margin: 0;
  text-align: right;
}

.date-text {
  font-size: 14px;
  color: #909399;
  margin: 4px 0 0 0;
  text-align: right;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.action-card {
  border-radius: 8px;
}

.quick-action-btn {
  width: 100%;
  height: 60px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
