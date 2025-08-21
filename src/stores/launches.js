import { defineStore } from 'pinia'
import { getLaunchesAll, getLaunchesPast, getLaunchesUpcoming, queryByIds } from '../api/spacex'

export const useLaunchesStore = defineStore('launches', {
  state: () => ({
    items: [],
    loading: false,
    error: '',
    selected: null,
    details: null,
    sortBy: 'date',   // 'date' | 'name'
    sortDir: 'desc',  // 'asc' | 'desc'
  }),
  getters: {
    sorted(state) {
      const arr = [...state.items]
      const key = state.sortBy === 'name' ? 'name' : 'date_utc'
      arr.sort((a, b) => {
        const av = a?.[key] ?? ''
        const bv = b?.[key] ?? ''
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return state.sortDir === 'asc' ? cmp : -cmp
      })
      return arr
    }
  },
  actions: {
    async load(view) {
      this.loading = true; this.error = ''
      try {
        const fn = view === 'past' ? getLaunchesPast : view === 'upcoming' ? getLaunchesUpcoming : getLaunchesAll
        const { data } = await fn()
        console.log('[launches] fetched', view, Array.isArray(data) ? data.length : data)
        this.items = data
      } catch (e) {
        this.error = e?.message || 'Fetch error'
      } finally {
        this.loading = false
      }
    },
    async openDetails(launch) {
      this.selected = launch
      this.details = null
      try {
        const crewIds = (launch.crew ?? []).map(c => typeof c === 'string' ? c : (c.crew || c))
        const [rockets, launchpads, crews] = await Promise.all([
          queryByIds('rockets', [launch.rocket]),
          queryByIds('launchpads', [launch.launchpad]),
          crewIds.length ? queryByIds('crew', crewIds) : Promise.resolve({ data: { docs: [] } })
        ])
        this.details = {
          rocket: rockets.data.docs?.[0] ?? null,
          launchpad: launchpads.data.docs?.[0] ?? null,
          crew: crews.data.docs ?? []
        }
      } catch (e) {
        console.error(e)
      }
    },
    closeDetails() {
      this.selected = null
      this.details = null
    }
  }
})