<script setup>
import { fmtDateTime } from '../utils/format'

const props = defineProps({
  launch: { type: Object, required: true },
  details: { type: Object, default: null }
})
const emit = defineEmits(['close'])
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <header>
        <strong>{{ launch.name }}</strong>
        <button class="button" @click="emit('close')">Close</button>
      </header>
      <div class="content">
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:16px">
          <section>
            <h4 style="margin:0 0 8px 0">Launch Details</h4>
            <table class="table">
              <tbody>
                <tr><th>Date (local)</th><td>{{ fmtDateTime(launch.date_utc) }}</td></tr>
                <tr><th>Launchpad</th><td>{{ details?.launchpad?.name || launch.launchpad }}</td></tr>
                <tr><th>Rocket</th><td>{{ details?.rocket?.name || launch.rocket }}</td></tr>
              </tbody>
            </table>
            <div style="margin-top:12px">
              <h4 style="margin:0 0 8px 0">Description</h4>
              <p style="white-space:pre-wrap">{{ launch.details || '—' }}</p>
            </div>
          </section>
          <section>
            <h4 style="margin:0 0 8px 0">Crew ({{ details?.crew?.length || 0 }})</h4>
            <div v-if="details?.crew?.length">
              <table class="table">
                <thead><tr><th>Name</th><th>Role</th></tr></thead>
                <tbody>
                  <tr v-for="c in details.crew" :key="c.id">
                    <td>{{ c.name }}</td>
                    <td>{{ c.agency || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else><small>No crew listed.</small></div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>