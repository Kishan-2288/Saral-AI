import { api } from './api';

export const getDashboard = () => api('/admin/dashboard');
export const getAnalytics = () => api('/admin/analytics');
