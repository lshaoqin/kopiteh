'use client'

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation"
import { FilterSection } from "./components/FilterSection"
import { OrdersTable } from "./components/OrdersTable"
import { PaginationControls } from "./components/PaginationControls"
import type { Order as BaseOrder, OrderItem as BaseOrderItem, OrderItemModifier, Venue, Stall } from "../../../../../types"

// Extended types for admin view with additional fields
export interface OrderItem extends BaseOrderItem {
  item_id: number
  item_name: string
}

export interface Order extends Omit<BaseOrder, 'table_id'> {
  table_id: number
  table_number: string
  venue_id: number
  venue_name: string
  order_type?: 'STANDARD' | 'CUSTOM'
  order_item_name?: string  // For custom orders
  quantity?: number         // For custom orders
  unit_price?: string       // For custom orders
  items?: OrderItem[]
}

export default function ViewOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [stalls, setStalls] = useState<Stall[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStalls, setLoadingStalls] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<number | string>>(new Set())
  const [loadingItems, setLoadingItems] = useState<Set<number | string>>(new Set())
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const ordersPerPage = 15
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, user, accessToken, currentPage])

  useEffect(() => {
    if (venueId && accessToken) {
      fetchStallsByVenue(Number(venueId))
      setStallId("") // Reset stall filter when venue changes
    } else {
      setStalls([])
      setStallId("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      params.append('page', currentPage.toString())
      params.append('limit', ordersPerPage.toString())

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
        setOrders(data.payload.data.orders || [])
        if (data.payload.data.pagination) {
          setTotalPages(data.payload.data.pagination.totalPages)
          setTotalOrders(data.payload.data.pagination.total)
        }
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
                remarks: item.remarks,
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
                remarks: item.remarks,
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

  const toggleOrderExpansion = (orderId: number | string) => {
    const newExpanded = new Set(expandedOrders)
    
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
      // Only fetch items for standard orders that haven't been loaded yet
      const order = orders.find(o => o.order_id === orderId)
      if (order && order.order_type === 'STANDARD' && !order.items) {
        fetchOrderItems(Number(orderId))
      }
      // For custom orders, the data is already in the order object
    }
    
    setExpandedOrders(newExpanded)
  }

  const handleApplyFilters = () => {
    setCurrentPage(1) // Reset to first page when applying filters
    fetchOrders()
  }

  const handleClearFilters = () => {
    setStartDate("")
    setEndDate("")
    setTableNumber("")
    setVenueId("")
    setStallId("")
    setCurrentPage(1) // Reset to first page
    fetchOrders()
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  if (!isHydrated || !user) {
    return null
  }

  return (
    <main className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">View Orders</h1>
      </div>

      <FilterSection
        startDate={startDate}
        endDate={endDate}
        tableNumber={tableNumber}
        venueId={venueId}
        stallId={stallId}
        venues={venues}
        stalls={stalls}
        loadingStalls={loadingStalls}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onTableNumberChange={setTableNumber}
        onVenueIdChange={setVenueId}
        onStallIdChange={setStallId}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

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
        <OrdersTable
          orders={orders}
          expandedOrders={expandedOrders}
          loadingItems={loadingItems}
          currentPage={currentPage}
          totalPages={totalPages}
          totalOrders={totalOrders}
          ordersPerPage={ordersPerPage}
          onToggleOrderExpansion={toggleOrderExpansion}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onPageClick={handlePageClick}
        />
      )}
    </main>
  )
}
