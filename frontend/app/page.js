'use client'

import { useState, useEffect } from "react";

export default function Home() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStalls() {
      try {
        const response = await fetch('http://localhost:4000/stalls');
        const data = await response.json();
        setStalls(data);
      } catch (err) {
        console.error('Failed to fetch stalls:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStalls();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Stalls:</h1>
      {stalls.length > 0 ? (
        <ul>
          {stalls.map(stall => (
            <li key={stall.id}>{stall.name}</li>
          ))}
        </ul>
      ) : (
        <p>No stalls found.</p>
      )}
    </main>
  );
}