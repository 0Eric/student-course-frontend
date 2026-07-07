<template>
  <div class="page-container">
    <TableCard title="成绩管理" :loading="loading">
      <template #search>
        <el-form inline class="search-form">
          <el-form-item label="选择课程">
            <el-select
              v-model="selectedCourseId"
              placeholder="请选择课程"
              style="width: 260px"
              @change="handleCourseChange"
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
      </template>

      <template v-if="!selectedCourseId && !loading">
        <el-empty description="请先选择课程" />
      </template>
      <template v-else-if="!loading && studentList.length === 0">
        <el-empty description="该课程暂无学生" />
      </template>
      <template v-else>
        <el-table :data="studentList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="studentNo" label="学号" width="140" />
          <el-table-column prop="realName" label="学生姓名" min-width="120" />
          <el-table-column prop="score" label="成绩" width="100" align="center">
            <template #default="{ row }">
              <el-tag
                v-if="row.score !== null && row.score !== undefined"
                :type="row.score >= 60 ? 'success' : 'danger'"
                size="large"
              >
                {{ row.score }}
              </el-tag>
              <span v-else class="no-data">未录入</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="openScoreDialog(row)"
              >
                {{ row.score !== null && row.score !== undefined ? '编辑' : '录入' }}
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
            @size-change="loadStudents"
            @current-change="loadStudents"
          />
        </div>
      </template>
    </TableCard>

    <!-- 录入/编辑成绩弹窗 -->
    <el-dialog
      v-model="scoreDialogVisible"
      :title="scoreEditId ? '编辑成绩' : '录入成绩'"
      width="400px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form
        ref="scoreFormRef"
        :model="scoreForm"
        :rules="scoreRules"
        label-width="80px"
      >
        <el-form-item label="学生姓名">
          <el-input :model-value="scoreStudentName" disabled />
        </el-form-item>
        <el-form-item label="成绩" prop="score">
          <el-input-number
            v-model="scoreForm.score"
            :min="0"
            :max="100"
            style="width: 200px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scoreDialogVisible = false" :disabled="scoreLoading">取消</el-button>
        <el-button type="primary" @click="handleScoreConfirm" :loading="scoreLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCoursePage } from '@/api/course'
import { getCourseScores, saveScore, updateScore } from '@/api/score'

const loading = ref(false)
const selectedCourseId = ref(null)
const courseOptions = ref([])
const studentList = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 成绩弹窗
const scoreDialogVisible = ref(false)
const scoreLoading = ref(false)
const scoreEditId = ref(null)
const scoreStudentName = ref('')
const scoreStudentId = ref(null)
const scoreFormRef = ref(null)
const scoreForm = reactive({
  score: 0
})
const scoreRules = {
  score: [
    { required: true, message: '请输入成绩', trigger: 'blur' }
  ]
}

const loadCourseOptions = async () => {
  try {
    const res = await getCoursePage({ pageNum: 1, pageSize: 999 })
    courseOptions.value = res.data?.records || res.data || []
  } catch {
    // silently fail
  }
}

const loadStudents = async () => {
  if (!selectedCourseId.value) return
  loading.value = true
  try {
    const res = await getCourseScores(selectedCourseId.value, { ...queryParams })
    studentList.value = res.data?.records || res.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error(e.message || '获取学生列表失败')
  } finally {
    loading.value = false
  }
}

const handleCourseChange = () => {
  queryParams.pageNum = 1
  loadStudents()
}

const openScoreDialog = (row) => {
  scoreStudentId.value = row.id || row.studentId || row.userId
  scoreStudentName.value = row.realName || row.username
  scoreEditId.value = row.scoreId || null
  scoreForm.score = row.score !== null && row.score !== undefined ? row.score : 0
  scoreDialogVisible.value = true
}

const handleScoreConfirm = async () => {
  if (!scoreFormRef.value) return
  try {
    await scoreFormRef.value.validate()
  } catch {
    return
  }

  scoreLoading.value = true
  try {
    const data = {
      courseId: selectedCourseId.value,
      studentId: scoreStudentId.value,
      score: scoreForm.score
    }
    if (scoreEditId.value) {
      await updateScore({ ...data, id: scoreEditId.value })
      ElMessage.success('成绩更新成功')
    } else {
      await saveScore(data)
      ElMessage.success('成绩录入成功')
    }
    scoreDialogVisible.value = false
    await loadStudents()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    scoreLoading.value = false
  }
}

onMounted(() => {
  loadCourseOptions()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.search-form {
  padding: 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 0;
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
