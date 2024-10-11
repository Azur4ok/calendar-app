let eventGuid = 0

export function createEventId() {
  return String(eventGuid++)
}

export function formatDateTime(date: Date | string, allDay: boolean): string {
  if (typeof date === 'string') {
    if (allDay) {
      return date.split('T')[0]
    }
    return date.slice(0, 16)
  }
  if (allDay) {
    return date.toISOString().split('T')[0]
  }
  return date.toISOString().slice(0, 16)
}
