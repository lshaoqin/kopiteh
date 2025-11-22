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
export const NextOrderStatusMap: { [key in OrderStatusCodes]?: OrderStatusCodes } = {
  [OrderStatusCodes.CONFIRMED]: OrderStatusCodes.PREPARING,
  [OrderStatusCodes.PREPARING]: OrderStatusCodes.SERVED,
};