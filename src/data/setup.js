/**
 * Database Setup Script
 * Creates database and tables
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
  try {
    console.log('🔧 Starting database setup...');

    const config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    };

    console.log(`Connecting to ${config.user}@${config.host}...`);

    // Connect without database selected
    const connection = await mysql.createConnection(config);
    console.log('Connected to MySQL server.');

    // Create Database
    const dbName = process.env.DB_NAME || 'gearguard';
    console.log(`Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' ready.`);

    // Use the database
    await connection.changeUser({ database: dbName });
    console.log(`Switched to database '${dbName}'.`);

    // Read Schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute Schema
    console.log('Executing schema...');
    await connection.query(schema);
    console.log('Schema applied successfully.');

    await connection.end();
    console.log('✅ Setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
        console.error('Make sure MySQL is running on port 3306.');
    }
  }
}

setup();
