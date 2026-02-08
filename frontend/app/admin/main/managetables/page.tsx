'use client'

import type { Venue, Table } from "../../../../../../../types"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { Button } from "@/components/ui/button"
import { Copy, Trash2, Plus } from "lucide-react"

export default function ManageTables() {
    const [venues, setVenues] = useState<Venue[]>([])
    const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null)
    const [tables, setTables] = useState<Table[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { accessToken } = useAuthStore()
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const [startNum, setStartNum] = useState<string>("")
    const [endNum, setEndNum] = useState<string>("")
    const [customTableName, setCustomTableName] = useState<string>("")
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [selectedTables, setSelectedTables] = useState<Set<number>>(new Set())
    const [showToast, setShowToast] = useState(false)

    // Load venues on mount
    useEffect(() => {
        const loadVenues = async () => {
            try {
                const res = await fetch(`${API_URL}/venue`)
                const data = await res.json()
                if (res.ok && data.success) {
                    setVenues(data.payload?.data ?? [])
                }
            } catch (err) {
                console.error("Failed to load venues", err)
            }
        }
        loadVenues()
    }, [API_URL])

    // Load tables when venue is selected
    useEffect(() => {
        if (!selectedVenueId) {
            setTables([])
            return
        }

        const loadTables = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`${API_URL}/tables/venue/${selectedVenueId}`)
                const data = await res.json()
                if (res.ok && data.success) {
                    setTables(data.payload?.data ?? [])
                } else {
                    throw new Error(data?.payload?.message ?? "Failed to fetch tables")
                }
            } catch (err: any) {
                setError(err.message ?? "There is an error loading tables")
                setTables([])
            } finally {
                setLoading(false)
            }
        }
        loadTables()
    }, [API_URL, selectedVenueId])

    const handleCreateIndividual = async () => {
        if (!selectedVenueId) return

        const trimmedName = customTableName.trim()
        if (!trimmedName) {
            setCreateError("Please enter a table name")
            return
        }

        try {
            setCreating(true)
            setCreateError(null)

            const qrCode = `qr-${selectedVenueId}-${trimmedName}-${Date.now()}`
            const res = await fetch(`${API_URL}/tables/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    venue_id: selectedVenueId,
                    table_number: trimmedName,
                    qr_code: qrCode,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data?.payload?.message ?? "Failed to create table")
            }

            const newTable = data.payload?.data
            setTables((curr) => [...curr, newTable])
            setCustomTableName("")
        } catch (err: any) {
            setCreateError(err.message ?? "Failed to create table")
        } finally {
            setCreating(false)
        }
    }

    const handleCreateRange = async () => {
        if (!selectedVenueId) return

        const start = parseInt(startNum)
        const end = parseInt(endNum)

        if (isNaN(start) || isNaN(end)) {
            setCreateError("Please enter valid numbers")
            return
        }

        if (start > end) {
            setCreateError("Start number must be less than or equal to end number")
            return
        }

        if (end - start > 100) {
            setCreateError("Cannot create more than 100 tables at once")
            return
        }

        try {
            setCreating(true)
            setCreateError(null)

            const res = await fetch(`${API_URL}/tables/create-bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    venue_id: selectedVenueId,
                    start_num: start,
                    end_num: end,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data?.payload?.message ?? "Failed to create tables")
            }

            const newTables = data.payload?.data ?? []
            setTables((curr) => [...curr, ...newTables])
            setStartNum("")
            setEndNum("")
        } catch (err: any) {
            setCreateError(err.message ?? "Failed to create tables")
        } finally {
            setCreating(false)
        }
    }

    const handleDeleteSelected = async () => {
        if (!selectedVenueId || selectedTables.size === 0) return

        const tableNumbersToDelete = tables
            .filter(t => selectedTables.has(t.table_id))
            .map(t => t.table_number)

        try {
            const res = await fetch(`${API_URL}/tables/remove-bulk`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    venue_id: selectedVenueId,
                    table_numbers: tableNumbersToDelete,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data?.payload?.message ?? "Failed to delete tables")
            }

            setTables((curr) => curr.filter(t => !selectedTables.has(t.table_id)))
            setSelectedTables(new Set())
        } catch (err: any) {
            console.error("Failed to delete tables", err)
        }
    }

    const handleCopyLink = (table: Table) => {
        const orderingLink = `${window.location.origin}/ordering/stalls?venue=${table.venue_id}&table=${table.table_number}`
        navigator.clipboard.writeText(orderingLink)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    const toggleTableSelection = (tableId: number) => {
        setSelectedTables(prev => {
            const newSet = new Set(prev)
            if (newSet.has(tableId)) {
                newSet.delete(tableId)
            } else {
                newSet.add(tableId)
            }
            return newSet
        })
    }

    const toggleSelectAll = () => {
        if (selectedTables.size === tables.length) {
            setSelectedTables(new Set())
        } else {
            setSelectedTables(new Set(tables.map(t => t.table_id)))
        }
    }

    return (
        <main className="flex-1 p-8">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top">
                    <Copy className="w-5 h-5" />
                    <span>Link copied successfully!</span>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Manage Tables</h1>

                {/* Venue Selector */}
                <div className="mb-8">
                    <label className="block text-sm font-medium mb-2">Select Venue</label>
                    <select
                        className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary1"
                        value={selectedVenueId ?? ""}
                        onChange={(e) => {
                            setSelectedVenueId(e.target.value ? Number(e.target.value) : null)
                            setSelectedTables(new Set())
                        }}
                    >
                        <option value="">-- Select a Venue --</option>
                        {venues.map((v) => (
                            <option key={v.venue_id} value={v.venue_id}>
                                {v.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedVenueId && (
                    <>
                        {/* Add Tables */}
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <h2 className="text-xl font-semibold mb-4">Add Tables</h2>
                            
                            {/* Individual Table */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Individual Table</h3>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-2">Table Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary1"
                                            value={customTableName}
                                            onChange={(e) => setCustomTableName(e.target.value)}
                                            placeholder="e.g., A1, VIP-1, Table-A"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleCreateIndividual}
                                        disabled={creating || !customTableName.trim()}
                                        className="bg-primary1 hover:bg-primary1/90 text-white h-10"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {creating ? "Creating..." : "Add Table"}
                                    </Button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">OR</span>
                                </div>
                            </div>

                            {/* Range of Tables */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Tables by Range</h3>
                                <div className="flex gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Start Number</label>
                                        <input
                                            type="number"
                                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary1"
                                            value={startNum}
                                            onChange={(e) => setStartNum(e.target.value)}
                                            placeholder="e.g., 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">End Number</label>
                                        <input
                                            type="number"
                                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary1"
                                            value={endNum}
                                            onChange={(e) => setEndNum(e.target.value)}
                                            placeholder="e.g., 10"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleCreateRange}
                                        disabled={creating || !startNum || !endNum}
                                        className="bg-primary1 hover:bg-primary1/90 text-white h-10"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {creating ? "Creating..." : "Add Range"}
                                    </Button>
                                </div>
                            </div>

                            {createError && (
                                <p className="text-red-500 text-sm mt-4">{createError}</p>
                            )}
                        </div>

                        {/* Tables List */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Tables</h2>
                                {selectedTables.size > 0 && (
                                    <Button
                                        onClick={handleDeleteSelected}
                                        variant="destructive"
                                        className="bg-red-500 hover:bg-red-600"
                                    >
                                        <Trash2 className="w-4 h-10 mr-2" />
                                        Delete Selected ({selectedTables.size})
                                    </Button>
                                )}
                            </div>

                            {loading && <p className="text-gray-500">Loading tables...</p>}
                            {error && <p className="text-red-500">{error}</p>}
                            
                            {!loading && !error && tables.length === 0 && (
                                <p className="text-gray-500">No tables found for this venue. Add some tables using the form above.</p>
                            )}

                            {!loading && !error && tables.length > 0 && (
                                <>
                                    <div className="mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedTables.size === tables.length}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium">Select All</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tables.map((table) => (
                                            <div
                                                key={table.table_id}
                                                className={`border rounded-lg p-4 ${
                                                    selectedTables.has(table.table_id) 
                                                        ? 'border-primary1 bg-green-50' 
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTables.has(table.table_id)}
                                                        onChange={() => toggleTableSelection(table.table_id)}
                                                        className="mt-1 w-4 h-4"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">
                                                            Table {table.table_number}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            QR: {table.qr_code}
                                                        </p>
                                                        <Button
                                                            onClick={() => handleCopyLink(table)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2 text-xs"
                                                        >
                                                            <Copy className="w-3 h-3 mr-1" />
                                                            Copy Ordering Link
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}
