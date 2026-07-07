<template>
  <div class="profile-container" v-loading="loading">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never" class="profile-card">
          <template #header>
            <span class="card-title">个人信息</span>
          </template>
          <div class="user-avatar-section">
            <el-avatar :size="80" class="profile-avatar">
              {{ avatarText }}
            </el-avatar>
            <h3 class="user-name-text">{{ userStore.userInfo?.realName || userStore.userInfo?.username || '用户' }}</h3>
            <p class="user-role-text">{{ roleText }}</p>
          </div>
          <el-divider />
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">用户名</span>
              <span class="info-value">{{ userStore.userInfo?.username || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">真实姓名</span>
              <span class="info-value">{{ userStore.userInfo?.realName || '--' }}</span>
            </div>
            <div class="info-item" v-if="isStudentOrMonitor">
              <span class="info-label">学号</span>
              <span class="info-value">{{ userStore.userInfo?.studentNo || '--' }}</span>
            </div>
            <div class="info-item" v-if="isStudentOrMonitor">
              <span class="info-label">所属班级</span>
              <span class="info-value">{{ userStore.userInfo?.className || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">角色</span>
              <el-tag :type="roleTagType" size="small">{{ roleText }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never" class="profile-card">
          <template #header>
            <span class="card-title">账号设置</span>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">
              {{ userStore.userInfo?.username || '--' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="isStudentOrMonitor" label="学号">
              {{ userStore.userInfo?.studentNo || '--' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="isStudentOrMonitor" label="所属班级">
              {{ userStore.userInfo?.className || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userStore.userInfo?.phone || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userStore.userInfo?.email || '--' }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <div class="password-section">
            <h4 class="section-title">修改密码</h4>
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              size="default"
              class="password-form"
            >
              <el-form-item label="旧密码" prop="oldPassword">
                <el-input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入旧密码"
                  show-password
                  style="max-width: 360px"
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                  style="max-width: 360px"
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                  style="max-width: 360px"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :loading="passwordLoading"
                  @click="handleUpdatePassword"
                >
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { updatePassword } from '@/api/auth'

const userStore = useUserStore()
const loading = ref(true)

const avatarText = computed(() => {
  debugger;
  const name = userStore.userInfo?.realName || userStore.userInfo?.username || 'U'
  return name.charAt(0).toUpperCase()
})

const hasRole = (code) => userStore.roleCodes.includes(code)

const roleText = computed(() => {
  if (hasRole('PRINCIPAL')) return '校长'
  if (hasRole('TEACHER')) return '老师'
  if (hasRole('MONITOR')) return '班干部'
  if (hasRole('STUDENT')) return '学生'
  return '未知'
})

const roleTagType = computed(() => {
  if (hasRole('PRINCIPAL')) return 'danger'
  if (hasRole('TEACHER')) return 'warning'
  if (hasRole('MONITOR')) return 'success'
  return 'primary'
})

const isStudentOrMonitor = computed(() => {
  return hasRole('STUDENT') || hasRole('MONITOR')
})

const passwordFormRef = ref(null)
const passwordLoading = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPwd = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPwd, trigger: 'blur' }
  ]
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
  } catch {
    return
  }

  passwordLoading.value = true
  try {
    await updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e) {
    ElMessage.error(e.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await userStore.fetchUserInfo()
  } catch {
    // 刷新失败不阻塞页面
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
  min-height: 100%;
}

.profile-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.profile-avatar {
  background-color: #409eff;
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
}

.user-name-text {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.user-role-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-label {
  color: #909399;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.password-form {
  max-width: 500px;
}

.password-section {
  padding: 0 8px;
}
</style>