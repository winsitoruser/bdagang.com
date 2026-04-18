import { Sequelize } from 'sequelize';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables (.env then .env.local when present)
dotenv.config();
dotenv.config({ path: '.env.local' });

/** Shared Postgres settings: POSTGRES_* first, then DB_* (sequelize config) so one env block is enough */
const pgHost = process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost';
const pgPort = parseInt(
  process.env.POSTGRES_PORT || process.env.DB_PORT || '5432',
  10
);
const pgDatabase = process.env.POSTGRES_DB || process.env.DB_NAME || 'bedagang';
const pgUser = process.env.POSTGRES_USER || process.env.DB_USER || 'postgres';
const pgPassword =
  process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'postgres';

// Database connection URL from environment variable or fallback to development URL
const databaseUrl = process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/farmanesia_evo';

// Create Sequelize instance (for MySQL/legacy)
const sequelizeInstance = new Sequelize(databaseUrl, {
  dialect: 'mysql', // Default dialect
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

// PostgreSQL Pool for Finance Settings and other PostgreSQL features
const pool = new Pool({
  host: pgHost,
  port: pgPort,
  database: pgDatabase,
  user: pgUser,
  password: pgPassword,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Utility function to test database connection
export async function testConnection() {
  try {
    await sequelizeInstance.authenticate();
    console.log('✅ Koneksi database berhasil!');
    return true;
  } catch (error) {
    console.error('❌ Tidak dapat terhubung ke database:', error);
    return false;
  }
}

// Utility function to test PostgreSQL connection
export async function testPostgresConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL connection successful!');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    return false;
  }
}

// Export pool as default for PostgreSQL APIs
export default pool;

/** Parameterized queries (used by some inventory master APIs) */
export function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

// Export sequelize separately for legacy code
export const sequelize = sequelizeInstance;
