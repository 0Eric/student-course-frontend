<template>
  <div class="page-container">
    <TableCard title="课程管理" :loading="loading">
      <template #header-actions>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增课程
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

      <el-empty v-if="!loading && courseList.length === 0" description="暂无课程" />
      <template v-else>
        <el-table :data="courseList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="courseName" label="课程名称" min-width="160" />
          <el-table-column prop="className" label="班级" min-width="120" />
          <el-table-column prop="credit" label="学分" width="80" align="center" />
          <el-table-column label="容量" width="120" align="center">
            <template #default="{ row }">
              {{ row.enrolledCount || 0 }} / {{ row.capacity }}
            </template>
          </el-table-column>
          <el-table-column prop="schedule" label="上课时间" min-width="140" />
          <el-table-column prop="location" label="上课地点" min-width="140" />
          <el-table-column prop="semester" label="学期" min-width="120" />
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
            @size-change="getCourseList"
            @current-change="getCourseList"
          />
        </div>
      </template>
    </TableCard>

    <!-- 新增/编辑课程弹窗 -->
    <FormDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :fields="formFields"
      :form-data="formData"
      :loading="dialogLoading"
      @confirm="handleFormConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getCoursePage, createCourse, updateCourse, deleteCourse } from '@/api/course'
import { getClassPage } from '@/api/classes'

const userStore = useUserStore()
const loading = ref(false)
const courseList = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const classOptions = ref([])

const queryParams = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10
})

const searchFields = [
  { prop: 'keyword', label: '课程名称', type: 'input', placeholder: '搜索课程名称' }
]

const formData = reactive({
  courseName: '',
  credit: 3,
  classId: null,
  capacity: 50,
  semester: '2025-2026-1',
  schedule: '',
  location: ''
})

const formFields = computed(() => [
  { prop: 'courseName', label: '课程名称', type: 'input', required: true, placeholder: '请输入课程名称' },
  { prop: 'credit', label: '学分', type: 'number', required: true, min: 0.5, max: 10 },
  { prop: 'classId', label: '班级', type: 'select', required: true, options: classOptions.value, placeholder: '请选择班级' },
  { prop: 'capacity', label: '容量', type: 'number', required: true, min: 1, max: 200 },
  { prop: 'semester', label: '学期', type: 'input', required: true, placeholder: '如：2025-2026-1' },
  { prop: 'schedule', label: '上课时间', type: 'input', required: true, placeholder: '如：周一 08:00-09:40' },
  { prop: 'location', label: '上课地点', type: 'input', required: true, placeholder: '如：教学楼A301' }
])

const dialogTitle = computed(() => isEdit.value ? '编辑课程' : '新增课程')

const loadClassOptions = async () => {
  try {
    const res = await getClassPage({ pageNum: 1, pageSize: 999 })
    const list = res.data?.records || res.data || []
    classOptions.value = list.map(c => ({ label: c.fullName || c.className, value: c.id }))
  } catch (e) {
    ElMessage.error(e.message || '加载班级列表失败')
  }
}

const getCourseList = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams,
      teacherId: userStore.userInfo?.userId
    }
    const res = await getCoursePage(params)
    courseList.value = res.data?.records || res.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error(e.message || '获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = (params) => {
  queryParams.keyword = params.keyword || ''
  queryParams.pageNum = 1
  getCourseList()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.pageNum = 1
  getCourseList()
}

const resetForm = () => {
  Object.assign(formData, {
    courseName: '',
    credit: 3,
    classId: null,
    capacity: 50,
    semester: '2025-2026-1',
    schedule: '',
    location: ''
  })
}

const openCreateDialog = () => {
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(formData, {
    courseName: row.courseName,
    credit: row.credit ?? 3,
    classId: row.classId,
    capacity: row.capacity,
    semester: row.semester || '',
    schedule: row.schedule || '',
    location: row.location || ''
  })
  dialogVisible.value = true
}

const handleFormConfirm = async (data) => {
  dialogLoading.value = true
  try {
    const payload = {
      courseName: data.courseName,
      credit: data.credit,
      classId: data.classId,
      capacity: data.capacity,
      semester: data.semester,
      schedule: data.schedule,
      location: data.location
    }
    if (isEdit.value) {
      await updateCourse(editId.value, payload)
      ElMessage.success('课程更新成功')
    } else {
      await createCourse(payload)
      ElMessage.success('课程创建成功')
    }
    dialogVisible.value = false
    await getCourseList()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    dialogLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程「${row.courseName}」吗？如已有学生选课则无法删除。`,
      '删除确认',
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
    await deleteCourse(row.id)
    ElMessage.success('课程删除成功')
    await getCourseList()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClassOptions()
  getCourseList()
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
