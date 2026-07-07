<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="formRules"
      :label-width="labelWidth"
      size="default"
      v-loading="loading"
    >
      <el-form-item
        v-for="field in fields"
        :key="field.prop"
        :label="field.label"
        :prop="field.prop"
      >
        <!-- 文本输入 -->
        <el-input
          v-if="!field.type || field.type === 'input'"
          v-model="formModel[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :disabled="field.disabled"
          :type="field.inputType || 'text'"
          :show-password="field.inputType === 'password'"
        />
        <!-- 数字输入 -->
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formModel[field.prop]"
          :min="field.min || 0"
          :max="field.max || 100"
          :disabled="field.disabled"
        />
        <!-- 下拉选择 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formModel[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :disabled="field.disabled"
          :multiple="field.multiple"
          style="width: 100%"
        >
          <el-option
            v-for="opt in field.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <!-- 文本域 -->
        <el-input
          v-else-if="field.type === 'textarea'"
          v-model="formModel[field.prop]"
          type="textarea"
          :rows="field.rows || 3"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :disabled="field.disabled"
        />
        <!-- 开关 -->
        <el-switch
          v-else-if="field.type === 'switch'"
          v-model="formModel[field.prop]"
          :disabled="field.disabled"
        />
        <!-- 日期 -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formModel[field.prop]"
          type="date"
          :placeholder="field.placeholder || `请选择${field.label}`"
          value-format="YYYY-MM-DD"
          :disabled="field.disabled"
          style="width: 100%"
        />
      </el-form-item>
      <slot name="extra" />
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '表单'
  },
  width: {
    type: String,
    default: '500px'
  },
  labelWidth: {
    type: String,
    default: '100px'
  },
  fields: {
    type: Array,
    default: () => []
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'close'])

const formRef = ref(null)
const visible = ref(props.modelValue)

const formModel = reactive({})

const initFormModel = () => {
  const model = {}
  props.fields.forEach(field => {
    model[field.prop] = props.formData[field.prop] ?? field.default ?? (field.type === 'switch' ? false : '')
  })
  Object.assign(formModel, model)
}

// 根据 fields 动态生成校验规则
const formRules = computedRules()

function computedRules() {
  const rules = { ...props.rules }
  props.fields.forEach(field => {
    if (field.required && !rules[field.prop]) {
      rules[field.prop] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' }
      ]
    }
  })
  return rules
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    initFormModel()
  }
})

watch(() => props.formData, () => {
  if (visible.value) {
    initFormModel()
  }
}, { deep: true })

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleConfirm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    emit('confirm', { ...formModel })
  } catch (e) {
    return false
  }
}
</script>
