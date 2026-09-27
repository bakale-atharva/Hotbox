const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** All prices are stored as integer cents. */
export function formatPrice(cents: number) {
  return currency.format(cents / 100);
}

const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});
const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

export function formatDateTime(ms: number) {
  return dateTime.format(ms);
}

export function formatTime(ms: number) {
  return time.format(ms);
}

export function shortOrderId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function pluralize(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}
