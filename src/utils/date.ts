/**
 * Formats an ISO date string or timestamp into a human-readable relative time string in Spanish.
 * If the input is already a human-readable string that cannot be parsed as a date, it is returned as-is.
 */
export function formatRelativeTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'Ahora mismo';

  let date: Date;
  if (typeof dateInput === 'string') {
    const parsed = new Date(dateInput);
    if (isNaN(parsed.getTime())) {
      // If it's a legacy pre-formatted string (e.g. "Hace 10 minutos"), return as-is
      return dateInput;
    }
    date = parsed;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 0) {
    return 'En el futuro';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) {
    return 'Ahora mismo';
  }
  if (diffMin < 60) {
    return `Hace ${diffMin} min`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
  }
  if (diffDays < 7) {
    return diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
  }

  // Older dates: format as DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculates the waiting duration in minutes from an ISO date string to now.
 */
export function getMinutesElapsed(dateInput?: string | number | Date | null): number {
  if (!dateInput) return 0;
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  if (isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (60 * 1000)));
}
