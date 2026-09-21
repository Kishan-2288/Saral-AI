import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("saral_receptionist_token");
    const savedUser = localStorage.getItem("saral_receptionist_user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("saral_receptionist_user");
        localStorage.removeItem("saral_receptionist_token");
      }
    }

    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!data.access_token) {
      throw new Error("Login response did not contain an access token");
    }

    localStorage.setItem(
      "saral_receptionist_token",
      data.access_token
    );

    if (data.user) {
      localStorage.setItem(
        "saral_receptionist_user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
    }

    return data;
  }

  function logout() {
    localStorage.removeItem("saral_receptionist_token");
    localStorage.removeItem("saral_receptionist_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}