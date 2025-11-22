export enum OrderStatusCodes {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderItemStatusCodes {
  CONFIRMED = 'INCOMING',
  PREPARING = 'PREPARING',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

// For updating to the next status
export const NextOrderItemStatusMap: { [key in OrderItemStatusCodes]?: OrderItemStatusCodes } = {
  [OrderItemStatusCodes.CONFIRMED]: OrderItemStatusCodes.PREPARING,
  [OrderItemStatusCodes.PREPARING]: OrderItemStatusCodes.SERVED,
};