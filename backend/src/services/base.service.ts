import db from '../config/database';
import type { PoolClient } from 'pg';

export const BaseService = {
  query: (text: string, params?: any[]) => db.query(text, params),
  async tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};
