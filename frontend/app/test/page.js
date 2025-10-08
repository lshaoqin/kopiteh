"use client";
import { useAuth } from "@/context/AuthContext";

export default function TestPage() {
  const { user, login, logout } = useAuth();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>AuthContext Test</h1>

      <p>
        <strong>Current user:</strong> {user ? user : "No user logged in"}
      </p>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => login("Evan")} style={{ marginRight: "1rem" }}>
          Log In as User
        </button>
        <button onClick={logout}>Log Out</button>
      </div>
    </div>
  );
}
