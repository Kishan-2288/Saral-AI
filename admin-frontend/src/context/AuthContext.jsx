import { createContext, useContext, useState } from 'react';
import { login as loginRequest } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('saral_admin_user') || 'null');
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const result = await loginRequest(email, password);
    if (result.user.role !== 'admin') throw new Error('Admin access required');
    localStorage.setItem('saral_admin_token', result.access_token);
    localStorage.setItem('saral_admin_user', JSON.stringify(result.user));
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem('saral_admin_token');
    localStorage.removeItem('saral_admin_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
