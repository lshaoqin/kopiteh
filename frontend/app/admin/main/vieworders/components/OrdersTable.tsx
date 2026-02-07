import { OrderRow } from "./OrderRow"
import { PaginationControls } from "./PaginationControls"

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
  table_number: string
  venue_name: string
  status: string
  total_price: string
  created_at: string
  remarks: string | null
  items?: OrderItem[]
}

interface OrdersTableProps {
  orders: Order[]
  expandedOrders: Set<number>
  loadingItems: Set<number>
  currentPage: number
  totalPages: number
  totalOrders: number
  ordersPerPage: number
  onToggleOrderExpansion: (orderId: number) => void
  onPrevPage: () => void
  onNextPage: () => void
  onPageClick: (page: number) => void
}

export function OrdersTable({
  orders,
  expandedOrders,
  loadingItems,
  currentPage,
  totalPages,
  totalOrders,
  ordersPerPage,
  onToggleOrderExpansion,
  onPrevPage,
  onNextPage,
  onPageClick,
}: OrdersTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Orders (Showing {orders.length} of {totalOrders})
        </h2>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
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
              <OrderRow
                key={order.order_id}
                order={order}
                isExpanded={expandedOrders.has(order.order_id)}
                isLoadingItems={loadingItems.has(order.order_id)}
                onToggleExpand={() => onToggleOrderExpansion(order.order_id)}
              />
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No orders found. Try adjusting your filters.
          </div>
        )}
      </div>
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalOrders={totalOrders}
        ordersPerPage={ordersPerPage}
        ordersOnCurrentPage={orders.length}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onPageClick={onPageClick}
      />
    </div>
  )
}
