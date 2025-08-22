import { defineStore } from 'pinia'
import { getLaunchesAll, getLaunchesPast, getLaunchesUpcoming, queryByIds } from '../api/spacex'
import { fmtDateTime } from '../utils/format'
import dayjs from 'dayjs'
import { toCsv, downloadCsv } from '../utils/csv'
import { toWorkbook, downloadXlsx } from '../utils/excel'

export const useLaunchesStore = defineStore('launches', {
  state: () => ({
    items: [],
    loading: false,
    error: '',
    selected: null,
    details: null,
    sortBy: 'date',   // 'date' | 'name'
    sortDir: 'desc',  // 'asc' | 'desc'
    searchTerm: '',
    selectedIds: new Set(), // Track selected row IDs
    selectionMode: false
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
    
    // Selection management
    toggleSelectionMode() { this.selectionMode = !this.selectionMode },
    clearSelection() { this.selectedIds.clear() },
    isSelected(id) { return this.selectedIds.has(id) },
    select(id) { this.selectedIds.add(id) },
    deselect(id) { this.selectedIds.delete(id) },
    toggle(id) { 
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id)
      } else {
        this.selectedIds.add(id)
      }
    },
    
    // Helper to get rows for export based on scope
    rowsForExport(scope, topN) {
      const base = this.filteredSorted
      
      if (scope === 'selected') {
        return base.filter(item => this.selectedIds.has(item.id))
      } else if (scope === 'top') {
        return base.slice(0, Math.min(topN || 10, base.length))
      } else {
        return base // 'all'
      }
    },
    
    // Helper to prepare export data
    prepareExportData(rows) {
      return rows.map(it => ({
        name: it?.name || '',
        date_local: fmtDateTime(it?.date_utc),
        crew_count: Array.isArray(it?.crew) ? it.crew.length : 0,
        flight_number: it?.flight_number ?? '',
        status: it?.upcoming === true ? 'Upcoming' : (it?.success === true ? 'Success' : (it?.success === false ? 'Failed' : ''))
      }))
    },
    
    async load(view) {
      this.loading = true; this.error = ''
      try {
        const isFailed = view === 'failed'
        const isSuccess = view === 'success'
        const fn = (isFailed || isSuccess)
          ? getLaunchesPast
          : view === 'past' ? getLaunchesPast : view === 'upcoming' ? getLaunchesUpcoming : getLaunchesAll
        const { data } = await fn()
        if (import.meta?.env?.DEV) {
          console.log('[launches] fetched', view, Array.isArray(data) ? data.length : data)
        }
        if (Array.isArray(data) && (isFailed || isSuccess)) {
          this.items = data.filter(it => !it?.upcoming && (
            isFailed ? it?.success === false : it?.success === true
          ))
        } else {
          this.items = data
        }
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
    },
    
    // Export functions
    exportCsv(scope, topN) {
      const rows = this.rowsForExport(scope, topN)
      if (!rows?.length) { alert('No data to export'); return }
      
      const exportData = this.prepareExportData(rows)
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'date_local', label: 'Date (Local)' },
        { key: 'crew_count', label: 'Crew' },
        { key: 'flight_number', label: 'Flight #' },
        { key: 'status', label: 'Status' }
      ]
      
      const csv = toCsv(exportData, headers)
      const ts = dayjs().format('YYYYMMDD_HHmm')
      const filename = `spacex_launches_${scope}_${ts}.csv`
      downloadCsv(csv, filename)
    },
    
    exportExcel(scope, topN) {
      const rows = this.rowsForExport(scope, topN)
      if (!rows?.length) { alert('No data to export'); return }
      
      const exportData = this.prepareExportData(rows)
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'date_local', label: 'Date (Local)' },
        { key: 'crew_count', label: 'Crew' },
        { key: 'flight_number', label: 'Flight #' },
        { key: 'status', label: 'Status' }
      ]
      
      const workbook = toWorkbook(exportData, headers)
      const ts = dayjs().format('YYYYMMDD_HHmm')
      const filename = `spacex_launches_${scope}_${ts}.xlsx`
      downloadXlsx(workbook, filename)
    },
    
    // Optional JSON export
    exportJson(view) {
      const items = this.filteredSorted
      if (!items?.length) { alert('No data to export'); return }
      const json = JSON.stringify(items, null, 2)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const ts = dayjs().format('YYYYMMDD_HHmm')
      const a = document.createElement('a')
      a.href = url
      a.download = `spacex_launches_${view || 'all'}_${ts}.json`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }
})