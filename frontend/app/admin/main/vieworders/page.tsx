'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"

interface OrderItemModifier {
  order_item_option_id: number
  option_name: string
  price_modifier: string
}

interface OrderItem {
  order_item_id: number
  item_id: number
  item_name: string
  quantity: number
  price: string
  status: string
  modifiers: OrderItemModifier[]
}

interface Order {
  order_id: number
  table_id: number
  table_number: string
  venue_id: number
  venue_name: string
  user_id: number
  status: string
  total_price: string
  created_at: string
  remarks: string | null
  items?: OrderItem[]
}

interface Venue {
  venue_id: number
  name: string
}

interface Stall {
  stall_id: number
  name: string
  venue_id: number
}

export default function ViewOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [stalls, setStalls] = useState<Stall[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStalls, setLoadingStalls] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set())
  
  // Filters
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [venueId, setVenueId] = useState("")
  const [stallId, setStallId] = useState("")

  const { user, isHydrated, accessToken } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/admin/auth/login")
    }
  }, [isHydrated, user, router])

  useEffect(() => {
    if (isHydrated && user && accessToken) {
      fetchVenues()
      fetchOrders()
    }
  }, [isHydrated, user, accessToken])

  useEffect(() => {
    if (venueId && accessToken) {
      fetchStallsByVenue(Number(venueId))
      setStallId("") // Reset stall filter when venue changes
    } else {
      setStalls([])
      setStallId("")
    }
  }, [venueId, accessToken])

  const fetchVenues = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venue`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      })
      const data = await res.json()
      if (data.success && data.payload?.data) {
        setVenues(data.payload.data)
      }
    } catch (err) {
      console.error("Failed to fetch venues:", err)
    }
  }

  const fetchStallsByVenue = async (venueId: number) => {
    setLoadingStalls(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stalls/venue/${venueId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      })
      const data = await res.json()
      if (data.success && data.payload?.data) {
        setStalls(data.payload.data)
      }
    } catch (err) {
      console.error("Failed to fetch stalls:", err)
      setStalls([])
    } finally {
      setLoadingStalls(false)
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', new Date(startDate).toISOString())
      if (endDate) params.append('endDate', new Date(endDate).toISOString())
      if (tableNumber) params.append('tableNumber', tableNumber)
      if (venueId) params.append('venueId', venueId)
      if (stallId) params.append('stallId', stallId)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order?${params.toString()}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch orders")
      }

      if (data.success && data.payload?.data) {
        setOrders(data.payload.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderItems = async (orderId: number) => {
    if (loadingItems.has(orderId)) return

    setLoadingItems(prev => new Set(prev).add(orderId))

    try {
      // Fetch order items
      const itemsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orderItem/order/${orderId}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )

      const itemsData = await itemsRes.json()

      if (itemsData.success && itemsData.payload?.data) {
        const items = itemsData.payload.data

        // Fetch modifiers for each item
        const itemsWithModifiers = await Promise.all(
          items.map(async (item: any) => {
            try {
              const modRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orderItem/modifiers/${item.order_item_id}`,
                {
                  headers: {
                    "Authorization": `Bearer ${accessToken}`,
                  },
                }
              )

              const modData = await modRes.json()

              return {
                order_item_id: item.order_item_id,
                item_id: item.item_id,
                item_name: item.order_item_name,
                quantity: item.quantity,
                price: item.price,
                status: item.status,
                modifiers: modData.success && modData.payload?.data ? modData.payload.data : [],
              }
            } catch {
              return {
                order_item_id: item.order_item_id,
                item_id: item.item_id,
                item_name: item.order_item_name,
                quantity: item.quantity,
                price: item.price,
                status: item.status,
                modifiers: [],
              }
            }
          })
        )

        setOrders(prev =>
          prev.map(o =>
            o.order_id === orderId ? { ...o, items: itemsWithModifiers } : o
          )
        )
      }
    } catch (err) {
      console.error("Failed to fetch order items:", err)
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders)
    
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
      // Fetch items if not already loaded
      const order = orders.find(o => o.order_id === orderId)
      if (order && !order.items) {
        fetchOrderItems(orderId)
      }
    }
    
    setExpandedOrders(newExpanded)
  }

  const handleApplyFilters = () => {
    fetchOrders()
  }

  const handleClearFilters = () => {
    setStartDate("")
    setEndDate("")
    setTableNumber("")
    setVenueId("")
    setStallId("")
    fetchOrders()
  }

  if (!isHydrated || !user) {
    return null
  }

  return (
    <main className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">View Orders</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Table Number</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table number"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Venue</label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Venues</option>
              {venues.map((venue) => (
                <option key={venue.venue_id} value={venue.venue_id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
          {venueId && (
            <div>
              <label className="block text-sm font-medium mb-2">Stall</label>
              <select
                value={stallId}
                onChange={(e) => setStallId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingStalls}
              >
                <option value="">All Stalls</option>
                {stalls.map((stall) => (
                  <option key={stall.stall_id} value={stall.stall_id}>
                    {stall.name}
                  </option>
                ))}
              </select>
              {loadingStalls && (
                <p className="text-xs text-gray-500 mt-1">Loading stalls...</p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700">
            Apply Filters
          </Button>
          <Button onClick={handleClearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Orders ({orders.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <>
                    <tr key={order.order_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {order.venue_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {order.table_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        ${parseFloat(order.total_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => toggleOrderExpansion(order.order_id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {expandedOrders.has(order.order_id) ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Items
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Items
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedOrders.has(order.order_id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          {loadingItems.has(order.order_id) ? (
                            <p className="text-gray-600 text-center">Loading items...</p>
                          ) : order.items && order.items.length > 0 ? (
                            <div className="space-y-4">
                              {order.remarks && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                  <p className="text-sm font-medium text-yellow-900">Order Remarks:</p>
                                  <p className="text-sm text-yellow-800">{order.remarks}</p>
                                </div>
                              )}
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <div key={item.order_item_id} className="border border-gray-200 rounded p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-medium text-gray-900">{item.item_name}</p>
                                        <p className="text-sm text-gray-600">
                                          Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                        </p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                          item.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {item.status}
                                        </span>
                                      </div>
                                    </div>
                                    {item.modifiers && item.modifiers.length > 0 && (
                                      <div className="mt-2 pl-4 border-l-2 border-gray-300">
                                        <p className="text-xs font-medium text-gray-700 mb-1">Modifiers:</p>
                                        {item.modifiers.map((mod) => (
                                          <div key={mod.order_item_option_id} className="flex justify-between text-xs text-gray-600">
                                            <span>• {mod.option_name}</span>
                                            <span>+${parseFloat(mod.price_modifier).toFixed(2)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-600 text-center">No items found for this order</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No orders found. Try adjusting your filters.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
