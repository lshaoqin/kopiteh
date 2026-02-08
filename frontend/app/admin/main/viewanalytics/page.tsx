'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation"
import type { Venue } from "../../../../../types"

interface StallAnalytics {
  stall_id: number
  stall_name: string
  total_orders: number
  total_amount: string
}

interface MonthlyAnalytics {
  total_orders: number
  total_amount: string
  stalls: StallAnalytics[]
}

export default function ViewAnalytics() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user, isHydrated, logout, accessToken } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/admin/auth/login")
    }
  }, [isHydrated, user, router])

  useEffect(() => {
    if (isHydrated && user && accessToken) {
      fetchVenues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, user, accessToken])

  useEffect(() => {
    if (selectedVenueId && accessToken) {
      fetchAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, selectedVenueId, accessToken])

  const fetchVenues = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venue`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      const data = await res.json()
      if (data.success && data.payload?.data) {
        const venueList = data.payload.data
        setVenues(venueList)
        // Set first venue as default
        if (venueList.length > 0 && !selectedVenueId) {
          setSelectedVenueId(venueList[0].venue_id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch venues:", err)
    }
  }

  const fetchAnalytics = async () => {
    if (!selectedVenueId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/analytics/monthly?year=${selectedYear}&month=${selectedMonth}&venueId=${selectedVenueId}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch analytics")
      }

      if (data.success && data.payload?.data) {
        setAnalytics(data.payload.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isHydrated || !user) {
    return null
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">View Analytics</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Venue</label>
            <select
              value={selectedVenueId ?? ""}
              onChange={(e) => setSelectedVenueId(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {venues.map((venue) => (
                <option key={venue.venue_id} value={venue.venue_id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Display */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {!loading && !error && analytics && (
        <>
          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Orders</h3>
              <p className="text-4xl font-bold text-blue-700">{analytics.total_orders}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Total Expenditure</h3>
              <p className="text-4xl font-bold text-green-700">
                ${parseFloat(analytics.total_amount).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Per-Stall Analytics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Breakdown by stall</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stall Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Expenditure
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.stalls.map((stall) => (
                    <tr key={stall.stall_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stall.stall_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {stall.total_orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        ${parseFloat(stall.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analytics.stalls.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No stall data available for this period.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  )
}