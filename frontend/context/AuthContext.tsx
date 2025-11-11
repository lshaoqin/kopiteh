"use client";
import { createContext, useContext, useState } from "react";
import type { User } from "../../types/auth";

interface AuthContextType {
  user: User | null;              // ✅ now uses your structured type
  login: (user: User) => void;    // ✅ login expects a full User object
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // You can later fetch user from API and set it
  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
