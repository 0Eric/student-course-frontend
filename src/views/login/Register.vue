<template>
  <div class="register-container">
    <el-card class="register-card" shadow="always">
      <template #header>
        <h2 class="register-title">注册新账号</h2>
        <p class="register-subtitle">创建您的学生课程管理系统账号</p>
      </template>
      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="80px"
        size="large"
        class="register-form"
        v-loading="loading"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="registerForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="registerForm.studentNo" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="所属班级" prop="classId">
          <el-select
            v-model="registerForm.classId"
            placeholder="请选择所属班级"
            style="width: 100%"
            :loading="classLoading"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.className"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleCode">
          <el-select
            v-model="registerForm.roleCode"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option label="学生" value="STUDENT" />
            <el-option label="老师" value="TEACHER" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleRegister"
          >
            注 册
          </el-button>
        </el-form-item>
        <el-form-item class="form-footer">
          <span class="login-text">
            已有账号？
            <el-link type="primary" @click="goLogin">返回登录</el-link>
          </span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getClassPage } from '@/api/classes'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const classLoading = ref(false)
const classList = ref([])

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  studentNo: '',
  classId: '',
  roleCode: 'STUDENT'
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  studentNo: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  classId: [
    { required: true, message: '请选择所属班级', trigger: 'change' }
  ],
  roleCode: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const loadClasses = async () => {
  classLoading.value = true
  try {
    const res = await getClassPage({ page: 1, pageSize: 100 })
    classList.value = res.data?.records || res.data || []
  } catch (e) {
    ElMessage.error('获取班级列表失败')
  } finally {
    classLoading.value = false
  }
}

onMounted(() => {
  loadClasses()
})

const handleRegister = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await userStore.registerAction({
      username: registerForm.username,
      password: registerForm.password,
      realName: registerForm.realName,
      studentNo: registerForm.studentNo,
      classId: registerForm.classId,
      roleCode: registerForm.roleCode
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    ElMessage.error(e.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 0;
}

.register-card {
  width: 520px;
  border-radius: 12px;
}

.register-title {
  text-align: center;
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.register-subtitle {
  text-align: center;
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #909399;
}

.register-form {
  padding: 0 8px;
}

.form-footer {
  margin-bottom: 0;
  text-align: center;
  display: flex;
  justify-content: center;
}

.login-text {
  font-size: 14px;
  color: #909399;
}
</style>
