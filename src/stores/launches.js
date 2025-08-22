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
    searchTerm: ''
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
    },
    filteredSorted(state) {
      const term = state.searchTerm?.trim().toLowerCase()
      const base = this.sorted
      if (!term) return base
      return base.filter(it => {
        const name = (it?.name || '').toLowerCase()
        const flight = String(it?.flight_number || '')
        return name.includes(term) || flight.includes(term)
      })
    }
  },
  actions: {
    setSearch(term) { this.searchTerm = term ?? '' },
    async load(view) {
      this.loading = true; this.error = ''
      try {
        const fn = view === 'past' ? getLaunchesPast : view === 'upcoming' ? getLaunchesUpcoming : getLaunchesAll
        const { data } = await fn()
        if (import.meta?.env?.DEV) {
          console.log('[launches] fetched', view, Array.isArray(data) ? data.length : data)
        }
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
        const crewIds = (launch.crew ?? [])
          .map(c => typeof c === 'string' ? c : (c.crew || c))
          .filter(Boolean)
        const rocketIds = [launch.rocket].filter(Boolean)
        const launchpadIds = [launch.launchpad].filter(Boolean)
        const [rockets, launchpads, crews] = await Promise.all([
          rocketIds.length ? queryByIds('rockets', rocketIds) : Promise.resolve({ data: { docs: [] } }),
          launchpadIds.length ? queryByIds('launchpads', launchpadIds) : Promise.resolve({ data: { docs: [] } }),
          crewIds.length ? queryByIds('crew', crewIds) : Promise.resolve({ data: { docs: [] } })
        ])
        this.details = {
          rocket: rockets.data.docs?.[0] ?? null,
          launchpad: launchpads.data.docs?.[0] ?? null,
          crew: crews.data.docs ?? []
        }
      } catch (e) {
        if (import.meta?.env?.DEV) console.error('[launches] details error', e)
      }
    },
    closeDetails() {
      this.selected = null
      this.details = null
    }
  }
})