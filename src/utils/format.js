import dayjs from 'dayjs'

export const fmtDateTime = (iso) => {
  if (!iso) return ''
  return dayjs(iso).format('DD MMM YYYY HH:mm')
}

export const launchStatusBadge = (launch) => {
  if (launch?.upcoming) return { text: 'Upcoming', tone: 'warning' }
  if (launch?.success === true) return { text: 'Success', tone: 'success' }
  if (launch?.success === false) return { text: 'Failed', tone: 'danger' }
  return null
}