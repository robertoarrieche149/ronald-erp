// Utilidad simple de fechas para evitar dependencias externas
export function format(dateStr, pattern = 'dd/MM/yyyy') {
  const d = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return pattern
    .replace('dd', pad(d.getDate()))
    .replace('MM', pad(d.getMonth() + 1))
    .replace('yyyy', d.getFullYear())
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
}

export function formatRelative(dateStr) {
  const now = new Date()
  const d = new Date(dateStr)
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Hace un momento'
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH}h`
  return format(dateStr)
}
