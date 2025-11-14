export enum OrderStatusCodes {
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