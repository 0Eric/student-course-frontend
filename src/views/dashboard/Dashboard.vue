<template>
  <el-container class="layout-container">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="layout-aside">
      <SidebarMenu :roles="userStore.roleCodes" :collapsed="appStore.sidebarCollapsed" />
    </el-aside>
    <el-container class="layout-main">
      <NavHeader />
      <el-main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import SidebarMenu from '@/components/SidebarMenu.vue'
import NavHeader from '@/components/NavHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

onMounted(async () => {
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (e) {
      userStore.logout()
      ElMessage.error('登录信息已失效，请重新登录')
      router.push('/login')
    }
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
}

.layout-aside {
  background-color: #001529;
  overflow: hidden;
  transition: width 0.3s ease;
}

.layout-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.layout-content {
  background-color: #f0f2f5;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
