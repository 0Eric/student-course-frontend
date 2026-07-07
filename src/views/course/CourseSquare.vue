<template>
  <div class="page-container">
    <TableCard title="课程广场" :loading="loading">
      <template #search>
        <SearchForm
          :fields="searchFields"
          :model="queryParams"
          @search="handleSearch"
          @reset="handleReset"
        />
      </template>

      <el-empty v-if="!loading && courseList.length === 0" description="暂无可用课程" />
      <template v-else>
        <el-row :gutter="16">
          <el-col
            v-for="course in courseList"
            :key="course.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            style="margin-bottom: 16px"
          >
            <el-card shadow="hover" class="course-card">
              <div class="course-name">{{ course.courseName }}</div>
              <div class="course-info">
                <div class="info-row">
                  <span class="info-label">教师：</span>
                  <span>{{ course.teacherName || '--' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">学分：</span>
                  <span>{{ course.credits }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">容量：</span>
                  <span>
                    {{ course.enrolledCount || 0 }} / {{ course.capacity }}
                    <el-progress
                      :percentage="capacityPercent(course)"
                      :status="course.enrolledCount >= course.capacity ? 'exception' : 'success'"
                      :stroke-width="6"
                      style="width: 100px; display: inline-block; margin-left: 8px"
                    />
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">上课时间：</span>
                  <span>{{ course.schedule || '--' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">上课地点：</span>
                  <span>{{ course.location || '--' }}</span>
                </div>
              </div>
              <div class="course-action">
                <el-button
                  type="primary"
                  :disabled="course.enrolledCount >= course.capacity || course.enrolled"
                  @click="handleEnroll(course)"
                >
                  {{ course.enrolled ? '已选' : course.enrolledCount >= course.capacity ? '已满' : '选课' }}
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[8, 12, 16, 20]"
            :total="total"
            layout="total, sizes, prev, pager, next"
            @size-change="getCourseList"
            @current-change="getCourseList"
          />
        </div>
      </template>
    </TableCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAvailableCourses } from '@/api/course'
import { enroll } from '@/api/enrollment'

const loading = ref(false)
const courseList = ref([])
const total = ref(0)

const queryParams = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 8
})

const searchFields = [
  { prop: 'keyword', label: '课程名称', type: 'input', placeholder: '搜索课程名称' }
]

const capacityPercent = (course) => {
  if (!course.capacity) return 0
  return Math.round(((course.enrolledCount || 0) / course.capacity) * 100)
}

const getCourseList = async () => {
  loading.value = true
  try {
    const res = await getAvailableCourses({ ...queryParams })
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

const handleEnroll = async (course) => {
  try {
    await ElMessageBox.confirm(`确定要选课「${course.courseName}」吗？`, '选课确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
  } catch {
    return
  }

  loading.value = true
  try {
    await enroll({ courseId: course.id })
    ElMessage.success('选课成功')
    await getCourseList()
  } catch (e) {
    ElMessage.error(e.message || '选课失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getCourseList()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.course-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
}

.course-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.course-info {
  margin-bottom: 12px;
}

.info-row {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.info-label {
  color: #909399;
  flex-shrink: 0;
}

.course-action {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>
