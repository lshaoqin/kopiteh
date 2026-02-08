import { Button } from "@/components/ui/button"

interface Venue {
  venue_id: number
  name: string
}

interface Stall {
  stall_id: number
  name: string
}

interface FilterSectionProps {
  startDate: string
  endDate: string
  tableNumber: string
  venueId: string
  stallId: string
  venues: Venue[]
  stalls: Stall[]
  loadingStalls: boolean
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onTableNumberChange: (value: string) => void
  onVenueIdChange: (value: string) => void
  onStallIdChange: (value: string) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export function FilterSection({
  startDate,
  endDate,
  tableNumber,
  venueId,
  stallId,
  venues,
  stalls,
  loadingStalls,
  onStartDateChange,
  onEndDateChange,
  onTableNumberChange,
  onVenueIdChange,
  onStallIdChange,
  onApplyFilters,
  onClearFilters,
}: FilterSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Table Number</label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => onTableNumberChange(e.target.value)}
            placeholder="Enter table number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Venue</label>
          <select
            value={venueId}
            onChange={(e) => onVenueIdChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
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
              onChange={(e) => onStallIdChange(e.target.value)}
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
        <Button onClick={onApplyFilters} className="bg-blue-600 hover:bg-blue-700">
          Apply Filters
        </Button>
        <Button onClick={onClearFilters} variant="outline">
          Clear Filters
        </Button>
      </div>
    </div>
  )
}
