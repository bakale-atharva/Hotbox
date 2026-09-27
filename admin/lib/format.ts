const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** All prices are stored as integer cents. */
export function formatPrice(cents: number) {
  return currency.format(cents / 100);
}

/** Parse a "12.99"-style input into cents, or null if it isn't a valid price. */
export function parsePriceToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const cents = Math.round(Number(trimmed) * 100);
  return cents > 0 ? cents : null;
}

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2);
}

/** "just now", "4 min", "1 h 12 min" */
export function formatElapsed(fromMs: number, nowMs: number) {
  const minutes = Math.max(0, Math.floor((nowMs - fromMs) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatTime(ms: number) {
  return timeFormat.format(ms);
}

export function formatDateTime(ms: number) {
  return dateTimeFormat.format(ms);
}

export function shortOrderId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}
