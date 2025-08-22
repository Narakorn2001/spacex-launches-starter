<script setup>
import { computed } from 'vue'
import { fmtDateTime, launchStatusBadge } from '../utils/format'
import { useLaunchesStore } from '../stores/launches'

const props = defineProps({
  item: { type: Object, required: true }
})

const store = useLaunchesStore()

const badge = computed(() => launchStatusBadge(props.item))
const crewCount = computed(() => Array.isArray(props.item.crew) ? props.item.crew.length : 0)
const img = computed(() => {
  const links = props.item?.links || {}
  const yt = links.youtube_id
  const youtubeThumb = yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : ''
  return (
    links?.patch?.small ||
    links?.flickr?.small?.[0] ||
    links?.flickr?.original?.[0] ||
    links?.patch?.large ||
    youtubeThumb ||
    ''
  )
})

const isSelected = computed(() => store.isSelected(props.item.id))
const showCheckbox = computed(() => store.selectionMode)

// local placeholder (bundled asset)
import placeholderUrl from '../assets/placeholder.svg?url'
const onImgError = (e) => { e.target.src = placeholderUrl }

const handleCheckboxChange = () => {
  store.toggle(props.item.id)
}

// ✅ อยู่ใน <script setup> ไม่แยก <script> ออกไปอีก
const badgeStyle = (tone) => {
  const map = {
    success: 'border-color:#1b3d2a;background:#0f2519;color:#9ae6b4',
    danger:  'border-color:#3b0c0c;background:#260909;color:#fecaca',
    warning: 'border-color:#3b2d0c;background:#261d09;color:#fde68a'
  }
  return map[tone] || ''
}
</script>

<template>
  <div class="card">
    <!-- Selection checkbox overlay -->
    <div v-if="showCheckbox" class="selection-overlay">
      <input 
        type="checkbox" 
        :checked="isSelected"
        @change="handleCheckboxChange"
        class="selection-checkbox"
      />
    </div>
    
    <img :src="img || placeholderUrl" referrerpolicy="no-referrer" loading="lazy" decoding="async"
        class="thumb" :alt="item.name"
        @error="onImgError" />
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
        <h3 style="margin:0;font-size:16px">{{ item.name }}</h3>
        <span v-if="badge" class="badge" :style="badgeStyle(badge.tone)">{{ badge.text }}</span>
      </div>
      <div><small>{{ fmtDateTime(item.date_utc) }}</small></div>
      <div class="badges">
        <span class="badge">Crew: {{ crewCount }}</span>
        <span v-if="item.flight_number" class="badge">Flight #{{ item.flight_number }}</span>
      </div>
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style scoped>
.selection-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

.selection-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent);
}

.card {
  position: relative;
}
</style>
