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
export const NextOrderStatusMap: { [key in OrderItemStatusCodes]?: OrderItemStatusCodes } = {
  [OrderItemStatusCodes.INCOMING]: OrderItemStatusCodes.PREPARING,
  [OrderItemStatusCodes.PREPARING]: OrderItemStatusCodes.SERVED,
};