<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLaunchesStore } from '../stores/launches'
import LaunchCard from '../components/LaunchCard.vue'
import LaunchDialog from '../components/LaunchDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useLaunchesStore()

const view = ref(route.params.view || 'all')
const sortBy = ref(store.sortBy)
const sortDir = ref(store.sortDir)
const showModal = ref(false)

onMounted(async () => {
  await store.load(view.value)
})

watch(() => route.params.view, async (v) => {
  view.value = v
  await store.load(view.value)
})

watch([sortBy, sortDir], () => {
  store.sortBy = sortBy.value
  store.sortDir = sortDir.value
})

function switchView(v) {
  if (v !== view.value) router.push({ name: 'launches', params: { view: v } })
}

function openDetails(item) {
  store.openDetails(item).then(() => { showModal.value = true })
}
</script>

<template>
  <div class="container">
    <div class="header">
      <div class="tabs" role="tablist" aria-label="Launch views">
        <button :class="{active: view==='all'}" @click="switchView('all')">All</button>
        <button :class="{active: view==='past'}" @click="switchView('past')">Past</button>
        <button :class="{active: view==='upcoming'}" @click="switchView('upcoming')">Upcoming</button>
      </div>

      <div class="controls">
        <label class="kbd">Sort by:</label>
        <select v-model="sortBy" class="select">
          <option value="date">Launch time</option>
          <option value="name">Name</option>
        </select>
        <select v-model="sortDir" class="select">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
    </div>

    <div v-if="store.loading">Loading...</div>
    <div v-else-if="store.error"
     style="padding:12px;border:1px solid var(--border);border-radius:12px;">
      <strong>Error:</strong> {{ store.error }}
      <div style="margin-top:8px">
        <button class="button" @click="store.load(view)">Retry</button>
      </div>
    </div>

    <div v-else class="grid">
      <LaunchCard v-for="item in store.sorted" :key="item.id" :item="item">
        <template #actions>
          <button class="button" @click="openDetails(item)">View details</button>
        </template>
      </LaunchCard>
    </div>

    <LaunchDialog v-if="showModal && store.selected" :launch="store.selected" :details="store.details" @close="showModal=false; store.closeDetails()" />
  </div>
</template>