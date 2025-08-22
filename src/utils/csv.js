// Build a CSV string from rows and headers, and helper to trigger download
// headers: Array<{ key: string; label: string }>

const needsQuote = (value) => {
  if (value == null) return false
  const s = String(value)
  return /[",\n\r]/.test(s) || s.startsWith(' ') || s.endsWith(' ')
}

const escapeField = (value) => {
  if (value == null) return ''
  let s = String(value)
  // escape quotes by doubling
  s = s.replace(/"/g, '""')
  return needsQuote(s) ? `"${s}"` : s
}

export const toCsv = (rows, headers) => {
  const head = headers.map(h => escapeField(h.label)).join(',')
  const lines = rows.map(row => headers.map(h => escapeField(row[h.key])).join(','))
  const csv = [head, ...lines].join('\r\n')
  // Prefix BOM for Excel UTF-8
  return '\uFEFF' + csv
}

export const downloadCsv = (csvString, filename) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}


