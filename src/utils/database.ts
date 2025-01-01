import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface QueryResult {
  results: any;
  fields: mysql.FieldPacket[];
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nuecms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function executeQuery(query: string, params: any[] = []): Promise<QueryResult> {
  const [results, fields] = await pool.execute(query, params);
  return { results, fields };
}
