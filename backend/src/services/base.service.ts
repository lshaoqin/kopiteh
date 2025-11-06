import db from '../config/database';

export const BaseService = {
  query: (text: string, params?: any[]) => db.query(text, params),
};
