import { Pool } from 'pg';
import { config } from './config';

export class Database {
  public pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      ssl: config.isProduction ? { rejectUnauthorized: false } : false,
      min: config.database.poolMin,
      max: config.database.poolMax,
    });
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}