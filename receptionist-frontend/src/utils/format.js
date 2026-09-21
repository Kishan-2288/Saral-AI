export const today = () => new Date().toISOString().slice(0, 10);

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatDate = (value) =>
  new Date(value).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });