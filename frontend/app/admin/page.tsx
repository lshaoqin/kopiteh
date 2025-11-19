'use client'

import type { Stall } from "../../../types/stall"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"

export default function Home() {
  const [stalls, setStalls] = useState<Stall[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const accessToken = useAuthStore.getState().accessToken;
  useEffect(() => {
    async function fetchStalls() {
      console.log(accessToken);
    }

    fetchStalls()
  }, [accessToken])

  return (
    <main className="p-2">
      <div>
        <h1>This is admin page</h1>
        <h1>Stalls:</h1>
        {stalls.length > 0 ? (
          <ul>
            {/* ✅ Type-safe access to stall.id and stall.name */}
            {stalls.map((stall) => (
              <li key={stall.stall_id}>{stall.name}</li>
            ))}
          </ul>
        ) : (
          <p>No stalls found.</p>
        )}
      </div>
    </main>
  )
}