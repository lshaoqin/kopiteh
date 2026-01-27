export enum OrderStatusCodes {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderItemStatusCodes {
  INCOMING = 'INCOMING',
  PREPARING = 'PREPARING',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

// For updating to the next status
export const NextOrderItemStatusMap: { [key in OrderItemStatusCodes]?: OrderItemStatusCodes } = {
  [OrderItemStatusCodes.INCOMING]: OrderItemStatusCodes.PREPARING,
  [OrderItemStatusCodes.PREPARING]: OrderItemStatusCodes.SERVED,
};

// Map OrderItem status to corresponding Order status
export const OrderItemToOrderStatusMap = {
  [OrderItemStatusCodes.INCOMING]: [OrderStatusCodes.PENDING],
  [OrderItemStatusCodes.PREPARING]: [OrderStatusCodes.PENDING],
  [OrderItemStatusCodes.SERVED]: [OrderStatusCodes.COMPLETED],
  [OrderItemStatusCodes.CANCELLED]: [OrderStatusCodes.CANCELLED],
};