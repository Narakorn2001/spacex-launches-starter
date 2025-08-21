import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://api.spacexdata.com/v4',
  timeout: 15000
})

// Simple endpoints
export const getLaunchesAll = () => api.get('/launches')
export const getLaunchesPast = () => api.get('/launches/past')
export const getLaunchesUpcoming = () => api.get('/launches/upcoming')

// Batch details via /query
export const queryByIds = (path, ids) => api.post(`/${path}/query`, {
  query: { _id: { $in: ids } },
  options: { pagination: false }
})