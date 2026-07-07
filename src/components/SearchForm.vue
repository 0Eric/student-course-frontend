<template>
  <el-form
    :model="formModel"
    inline
    class="search-form"
    size="default"
  >
    <el-form-item
      v-for="field in fields"
      :key="field.prop"
      :label="field.label"
    >
      <!-- 文本输入 -->
      <el-input
        v-if="field.type === 'input'"
        v-model="formModel[field.prop]"
        :placeholder="field.placeholder || `请输入${field.label}`"
        clearable
        style="width: 180px"
      />
      <!-- 下拉选择 -->
      <el-select
        v-else-if="field.type === 'select'"
        v-model="formModel[field.prop]"
        :placeholder="field.placeholder || `请选择${field.label}`"
        clearable
        style="width: 180px"
      >
        <el-option
          v-for="opt in field.options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <!-- 日期范围 -->
      <el-date-picker
        v-else-if="field.type === 'daterange'"
        v-model="formModel[field.prop]"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 240px"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <slot name="actions" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  fields: {
    type: Array,
    default: () => []
  },
  model: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['search', 'reset'])

const formModel = reactive({})

// 初始化表单字段
const initFormModel = () => {
  const model = {}
  props.fields.forEach(field => {
    model[field.prop] = props.model[field.prop] ?? field.default ?? ''
  })
  Object.assign(formModel, model)
}

initFormModel()

watch(() => props.model, () => {
  initFormModel()
}, { deep: true })

const handleSearch = () => {
  emit('search', { ...formModel })
}

const handleReset = () => {
  props.fields.forEach(field => {
    formModel[field.prop] = field.default ?? ''
  })
  emit('reset', { ...formModel })
}
</script>

<style scoped>
.search-form {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
</style>
