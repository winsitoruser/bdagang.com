/**
 * Wall clock in Asia/Jakarta (WIB) — default untuk jadwal shift multi-cabang di Indonesia.
 */
export function getJakartaClock(now = new Date()): {
  dateLocal: string;
  /** Menit sejak tengah malam [0, 1439] */
  minutesSinceMidnight: number;
} {
  const dateLocal = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

  return {
    dateLocal,
    minutesSinceMidnight: hour * 60 + minute,
  };
}

export function parseDbTimeToMinutes(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return null;
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (Number.isNaN(h) || Number.isNaN(min)) return null;
    return h * 60 + min;
  }
  if (value instanceof Date) {
    return value.getUTCHours() * 60 + value.getUTCMinutes();
  }
  return null;
}

/** Shift melewati tengah malam bila jam mulai >= jam selesai (mis. malam 22:00–06:00). */
export function isNowWithinShiftWindow(
  minutesNow: number,
  startM: number,
  endM: number
): boolean {
  if (startM < endM) {
    return minutesNow >= startM && minutesNow < endM;
  }
  if (startM > endM) {
    return minutesNow >= startM || minutesNow < endM;
  }
  return minutesNow === startM;
}
