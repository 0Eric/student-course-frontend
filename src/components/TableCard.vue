<template>
  <el-card shadow="never" class="table-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">{{ title }}</span>
        <div class="card-actions">
          <slot name="header-actions" />
        </div>
      </div>
    </template>
    <div class="card-search" v-if="$slots.search">
      <slot name="search" />
    </div>
    <div v-loading="loading" class="card-body">
      <slot />
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.table-card {
  margin: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-search {
  margin-bottom: 16px;
}

.card-body {
  min-height: 100px;
}
</style>
