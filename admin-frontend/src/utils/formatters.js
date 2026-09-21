export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function formatNumber(value) {
  return new Intl.NumberFormat().format(value ?? 0);
}
