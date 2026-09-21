import { api } from './api';

export const listStaff = () => api('/staff/');
export const createStaff = (payload) => api('/staff/', { method: 'POST', body: JSON.stringify(payload) });
export const updateStaff = (id, payload) => api(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteStaff = (id) => api(`/staff/${id}`, { method: 'DELETE' });
