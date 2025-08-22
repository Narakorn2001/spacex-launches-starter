<template>
  <div class="export-menu">
    <button 
      class="button" 
      @click="isOpen = !isOpen"
      :disabled="store.loading || !store.filteredSorted.length"
    >
      Export ▾
    </button>
    
    <div v-if="isOpen" class="dropdown">
      <div class="dropdown-content">
        <h4>Export Format</h4>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="format" value="csv" />
            CSV
          </label>
          <label>
            <input type="radio" v-model="format" value="excel" />
            Excel (.xlsx)
          </label>
        </div>

        <h4>Selection Scope</h4>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="scope" value="selected" />
            Selected rows only ({{ store.selectedIds.size }})
          </label>
          <label>
            <input type="radio" v-model="scope" value="all" />
            All rows (current view)
          </label>
          <label>
            <input type="radio" v-model="scope" value="top" />
            Top N rows
          </label>
        </div>

        <div v-if="scope === 'top'" class="top-n-input">
          <label>
            Number of rows:
            <input 
              type="number" 
              v-model.number="topN" 
              min="1" 
              :max="store.filteredSorted.length"
              class="select"
              style="width: 80px; margin-left: 8px;"
            />
          </label>
        </div>

        <div class="actions">
          <button 
            class="button" 
            @click="handleExport"
            :disabled="!canExport"
          >
            Export
          </button>
          <button class="button" @click="isOpen = false">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLaunchesStore } from '../stores/launches'

const store = useLaunchesStore()

const isOpen = ref(false)
const format = ref('csv')
const scope = ref('all')
const topN = ref(10)

const canExport = computed(() => {
  if (store.loading) return false
  
  if (scope.value === 'selected') {
    return store.selectedIds.size > 0
  }
  
  if (scope.value === 'top') {
    return topN.value > 0 && topN.value <= store.filteredSorted.length
  }
  
  return store.filteredSorted.length > 0
})

const handleExport = () => {
  const rows = store.rowsForExport(scope.value, topN.value)
  
  if (!rows || rows.length === 0) {
    alert('No data to export')
    return
  }
  
  if (format.value === 'csv') {
    store.exportCsv(scope.value, topN.value)
  } else {
    store.exportExcel(scope.value, topN.value)
  }
  
  isOpen.value = false
}
</script>

<style scoped>
.export-menu {
  position: relative;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  z-index: 1000;
}

.dropdown-content {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  min-width: 280px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.dropdown-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--text);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.top-n-input {
  margin-bottom: 16px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
