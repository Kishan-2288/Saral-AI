import { api } from './api';

export const login = (email, password) => api('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

export const verifyEmail = (token) => api(`/auth/verify-email?token=${encodeURIComponent(token)}`);
