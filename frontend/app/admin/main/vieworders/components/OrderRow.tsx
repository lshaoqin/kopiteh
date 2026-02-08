import { ChevronDown, ChevronUp } from "lucide-react"
import { OrderItemsList } from "./OrderItemsList"
import type { Order, OrderItem } from "../page"

interface OrderRowProps {
  order: Order
  isExpanded: boolean
  isLoadingItems: boolean
  onToggleExpand: () => void
}

export function OrderRow({ order, isExpanded, isLoadingItems, onToggleExpand }: OrderRowProps) {
  return (
    <>
      <tr className="hover:bg-gray-50">
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
            onClick={onToggleExpand}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {isExpanded ? (
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
      {isExpanded && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-gray-50">
            {isLoadingItems ? (
              <p className="text-gray-600 text-center">Loading items...</p>
            ) : order.items && order.items.length > 0 ? (
              <OrderItemsList items={order.items} />
            ) : (
              <p className="text-gray-600 text-center">No items found for this order</p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
