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

interface OrderItemsListProps {
  items: OrderItem[]
  remarks: string | null
}

export function OrderItemsList({ items, remarks }: OrderItemsListProps) {
  return (
    <div className="space-y-4">
      {remarks && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-medium text-yellow-900">Order Remarks:</p>
          <p className="text-sm text-yellow-800">{remarks}</p>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item) => (
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
  )
}
