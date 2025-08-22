// Excel export utilities using SheetJS
// Note: Requires 'xlsx' package to be installed

export const toWorkbook = (rows, headers) => {
  try {
    // Dynamic import to avoid build issues if xlsx is not installed
    const XLSX = require('xlsx')
    
    // Create worksheet data
    const wsData = [
      headers.map(h => h.label), // Header row
      ...rows.map(row => headers.map(h => row[h.key])) // Data rows
    ]
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // Auto-size columns
    const colWidths = headers.map((header, colIndex) => {
      const maxLength = Math.max(
        header.label.length,
        ...rows.map(row => String(row[header.key] || '').length)
      )
      return Math.min(Math.max(maxLength + 2, 10), 50) // Min 10, Max 50
    })
    
    ws['!cols'] = colWidths.map(width => ({ width }))
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Launches')
    
    return wb
  } catch (error) {
    console.error('Excel export failed. Make sure xlsx package is installed:', error)
    throw new Error('Excel export requires xlsx package. Please install it with: npm install xlsx')
  }
}

export const downloadXlsx = (workbook, filename) => {
  try {
    const XLSX = require('xlsx')
    
    // Write to buffer and create blob
    const wbout = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    })
    
    const blob = new Blob([wbout], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    // Download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Excel download failed:', error)
    throw error
  }
}

// Fallback function if xlsx is not available
export const isExcelSupported = () => {
  try {
    require('xlsx')
    return true
  } catch {
    return false
  }
}
