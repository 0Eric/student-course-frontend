<template>
  <div class="page-container">
    <TableCard title="教师管理" :loading="loading">
      <template #header-actions>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增教师
        </el-button>
      </template>
      <template #search>
        <SearchForm
          :fields="searchFields"
          :model="queryParams"
          @search="handleSearch"
          @reset="handleReset"
        />
      </template>

      <el-empty v-if="!loading && teacherList.length === 0" description="暂无教师数据" />
      <template v-else>
        <el-table :data="teacherList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="realName" label="真实姓名" min-width="120" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button
                :type="row.status === 1 ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
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
            @size-change="getTeacherList"
            @current-change="getTeacherList"
          />
        </div>
      </template>
    </TableCard>

    <!-- 新增教师弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新增教师"
      width="500px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="createForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false" :disabled="createLoading">取消</el-button>
        <el-button type="primary" @click="handleCreateTeacher" :loading="createLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑教师弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑教师"
      width="500px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="editForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="正常"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false" :disabled="editLoading">取消</el-button>
        <el-button type="primary" @click="handleEditTeacher" :loading="editLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getUserPage, updateUser, updateUserStatus } from '@/api/user'
import { register } from '@/api/auth'

const loading = ref(false)
const teacherList = ref([])
const total = ref(0)

const queryParams = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10
})

const searchFields = [
  { prop: 'keyword', label: '姓名/用户名', type: 'input', placeholder: '搜索教师姓名或用户名' }
]

// 新增教师
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref(null)
const createForm = reactive({
  username: '',
  password: '',
  realName: ''
})
const createRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ]
}

// 编辑教师
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const editId = ref(null)
const editForm = reactive({
  username: '',
  realName: '',
  status: 1
})
const editRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ]
}

const getTeacherList = async () => {
  loading.value = true
  try {
    const params = { ...queryParams, roleCode: 'TEACHER' }
    const res = await getUserPage(params)
    teacherList.value = res.data?.records || res.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error(e.message || '获取教师列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = (params) => {
  queryParams.keyword = params.keyword || ''
  queryParams.pageNum = 1
  getTeacherList()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.pageNum = 1
  getTeacherList()
}

const openCreateDialog = () => {
  createForm.username = ''
  createForm.password = ''
  createForm.realName = ''
  createDialogVisible.value = true
}

const handleCreateTeacher = async () => {
  if (!createFormRef.value) return
  try {
    await createFormRef.value.validate()
  } catch {
    return
  }

  createLoading.value = true
  try {
    await register({
      username: createForm.username,
      password: createForm.password,
      realName: createForm.realName,
      roleCode: 'TEACHER'
    })
    ElMessage.success('教师创建成功')
    createDialogVisible.value = false
    await getTeacherList()
  } catch (e) {
    ElMessage.error(e.message || '创建失败')
  } finally {
    createLoading.value = false
  }
}

const openEditDialog = (row) => {
  editId.value = row.id
  editForm.username = row.username
  editForm.realName = row.realName
  editForm.status = row.status
  editDialogVisible.value = true
}

const handleEditTeacher = async () => {
  if (!editFormRef.value) return
  try {
    await editFormRef.value.validate()
  } catch {
    return
  }

  editLoading.value = true
  try {
    await updateUser(editId.value, {
      realName: editForm.realName,
      status: editForm.status
    })
    ElMessage.success('教师信息更新成功')
    editDialogVisible.value = false
    await getTeacherList()
  } catch (e) {
    ElMessage.error(e.message || '更新失败')
  } finally {
    editLoading.value = false
  }
}

const handleToggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确定要${actionText}教师「${row.realName || row.username}」吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  loading.value = true
  try {
    await updateUserStatus(row.id, newStatus)
    ElMessage.success(`${actionText}成功`)
    await getTeacherList()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getTeacherList()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>
