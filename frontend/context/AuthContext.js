"use client";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// 2️⃣ Create a provider (wraps your whole app)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 

  const login = (name) => setUser(name);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}