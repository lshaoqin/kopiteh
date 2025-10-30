'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash2, Heart } from "lucide-react";

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
    <main className="p-2">
      <div>
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
      </div>
      <div className="flex flex-col w-[100px] space-y-3 my-4">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Search className="w-4 h-4 text-muted-foreground" />
      </div>
    </main>
  );
}