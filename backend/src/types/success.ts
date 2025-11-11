export enum SuccessCodes {
  OK = 'OK',
  CREATED = 'CREATED',
}

export const successTemplates: Record<SuccessCodes, { message: string; status: number }> = {
  [SuccessCodes.OK]: {
    message: 'Request processed successfully.',
    status: 200,
  },
  [SuccessCodes.CREATED]: {
    message: 'Resource created successfully.',
    status: 201,
  },
};
