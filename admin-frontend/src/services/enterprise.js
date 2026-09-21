import { api } from './api';

export const listEnterprises = () => api('/enterprises/');
export const getEnterprise = (id) => api(`/enterprises/${id}`);
export const createEnterprise = (payload) => api('/enterprises/', { method: 'POST', body: JSON.stringify(payload) });
export const updateEnterprise = (id, payload) => api(`/enterprises/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteEnterprise = (id) => api(`/enterprises/${id}`, { method: 'DELETE' });
