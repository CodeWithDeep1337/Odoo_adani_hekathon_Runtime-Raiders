/**
 * Database Configuration
 * MySQL connection pool and schema initialization
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('./env');

let pool = null;
let isConnected = false;

/**
 * Initialize database connection pool
 */
const initializePool = async () => {
  try {
    pool = mysql.createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('[Database] Connected to MySQL successfully');
    connection.release();
    isConnected = true;

    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    isConnected = false;
    return false;
  }
};

/**
 * Initialize database schema
 */
const initializeSchema = async () => {
  if (!isConnected || !pool) {
    console.warn('[Database] Cannot initialize schema: not connected');
    return false;
  }

  try {
    const schemaPath = path.join(__dirname, '../data/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    const connection = await pool.getConnection();

    // Execute schema file (split by semicolon)
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await connection.execute(statement);
      } catch (error) {
        // Ignore table exists errors
        if (!error.message.includes('already exists')) {
          console.error('[Database] Schema error:', error.message);
        }
      }
    }

    connection.release();
    console.log('[Database] Schema initialized successfully');
    return true;
  } catch (error) {
    console.error('[Database] Schema initialization failed:', error.message);
    return false;
  }
};

/**
 * Initialize database (connection + schema)
 */
const initializeDatabase = async () => {
  console.log('[Database] Initializing...');
  const poolConnected = await initializePool();

  if (poolConnected) {
    await initializeSchema();
  }

  return isConnected;
};

/**
 * Get database connection
 */
const getConnection = async () => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return await pool.getConnection();
};

/**
 * Execute query
 */
const query = async (sql, values = []) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
};

/**
 * Get database status
 */
const getStatus = () => ({
  connected: isConnected,
  database: config.DB_NAME,
  host: config.DB_HOST,
});

/**
 * Close database connection
 */
const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    isConnected = false;
    console.log('[Database] Connection closed');
  }
};

module.exports = {
  initializeDatabase,
  getConnection,
  query,
  getStatus,
  closeDatabase,
  pool,
};

