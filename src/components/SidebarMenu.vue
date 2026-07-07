<template>
  <div class="sidebar-menu-container">
    <div class="sidebar-logo">
      <h2 v-if="!collapsed" class="logo-text">学生课程管理</h2>
      <h2 v-else class="logo-text logo-text-small">SC</h2>
    </div>
    <el-menu
      :default-active="currentRoute"
      router
      :collapse="collapsed"
      class="sidebar-menu"
      background-color="#001529"
      text-color="#ffffffbf"
      active-text-color="#ffffff"
    >
      <!-- 学生菜单 -->
      <template v-if="hasRole('STUDENT') || hasRole('MONITOR')">
        <el-menu-item index="/dashboard/courses">
          <el-icon><Reading /></el-icon>
          <template #title>课程广场</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/my-courses">
          <el-icon><Notebook /></el-icon>
          <template #title>我的课程</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/my-scores">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>我的成绩</template>
        </el-menu-item>
      </template>

      <!-- 班干部额外菜单 -->
      <template v-if="hasRole('MONITOR')">
        <el-divider class="menu-divider" />
        <el-menu-item index="/dashboard/class/manage">
          <el-icon><UserFilled /></el-icon>
          <template #title>班级管理</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/class/enrollment">
          <el-icon><List /></el-icon>
          <template #title>班级选课</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/class/scores">
          <el-icon><TrendCharts /></el-icon>
          <template #title>班级成绩</template>
        </el-menu-item>
      </template>

      <!-- 老师菜单 -->
      <template v-if="hasRole('TEACHER')">
        <el-menu-item index="/dashboard/teacher/courses">
          <el-icon><Reading /></el-icon>
          <template #title>课程管理</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/teacher/scores">
          <el-icon><Edit /></el-icon>
          <template #title>成绩管理</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/teacher/students">
          <el-icon><UserFilled /></el-icon>
          <template #title>班级学生</template>
        </el-menu-item>
      </template>

      <!-- 校长菜单 -->
      <template v-if="hasRole('PRINCIPAL')">
        <el-menu-item index="/dashboard/admin/teachers">
          <el-icon><User /></el-icon>
          <template #title>教师管理</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/admin/scores">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>全校成绩</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/admin/reports">
          <el-icon><Document /></el-icon>
          <template #title>班级报表</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/admin/enrollment-stats">
          <el-icon><PieChart /></el-icon>
          <template #title>选课统计</template>
        </el-menu-item>
      </template>

      <el-divider class="menu-divider" />

      <!-- 个人中心（所有角色） -->
      <el-menu-item index="/dashboard/profile">
        <el-icon><Setting /></el-icon>
        <template #title>个人中心</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  roles: {
    type: Array,
    default: () => []
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const currentRoute = computed(() => route.path)

const hasRole = (roleCode) => {
  return props.roles.includes(roleCode)
}
</script>

<style scoped>
.sidebar-menu-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #001529;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  margin: 0;
}

.logo-text-small {
  font-size: 16px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.menu-divider {
  margin: 4px 16px;
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
