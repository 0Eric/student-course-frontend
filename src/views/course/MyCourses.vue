<template>
  <div class="page-container">
    <TableCard title="我的课程" :loading="loading">
      <el-empty v-if="!loading && courseList.length === 0" description="暂无已选课程" />
      <template v-else>
        <el-table :data="courseList" stripe style="width: 100%">
          <el-table-column prop="courseName" label="课程名称" min-width="160" />
          <el-table-column prop="teacherName" label="教师" min-width="120" />
          <el-table-column prop="credit" label="学分" width="80" align="center" />
          <el-table-column prop="schedule" label="上课时间" min-width="160" />
          <el-table-column label="成绩" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.score !== null && row.score !== undefined" :type="row.score >= 60 ? 'success' : 'danger'">
                {{ row.score }}
              </el-tag>
              <span v-else class="no-score">未录入</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                :disabled="row.score !== null && row.score !== undefined"
                @click="handleDrop(row)"
              >
                退课
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
            @size-change="getMyCourses"
            @current-change="getMyCourses"
          />
        </div>
      </template>
    </TableCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyEnrollments, dropCourse } from '@/api/enrollment'

const loading = ref(false)
const courseList = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

const getMyCourses = async () => {
  loading.value = true
  try {
    const res = await getMyEnrollments({ ...queryParams })
    courseList.value = res.data?.records || res.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error(e.message || '获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const handleDrop = async (row) => {
  if (row.score !== null && row.score !== undefined) {
    ElMessage.warning('该课程已有成绩，不能退课')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要退选「${row.courseName}」吗？`,
      '退课确认',
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
    const courseId = row.courseId || row.id
    await dropCourse(courseId)
    ElMessage.success('退课成功')
    await getMyCourses()
  } catch (e) {
    ElMessage.error(e.message || '退课失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getMyCourses()
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

.no-score {
  color: #909399;
  font-size: 13px;
}
</style>
