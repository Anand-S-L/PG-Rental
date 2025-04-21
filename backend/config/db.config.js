// Database configuration
// For this example, we're using an in-memory database
// In a real app, this would be your PostgreSQL connection setup

const dbConfig = {
  inMemory: true,
  // PostgreSQL config would be here if needed
  pg: {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'pg_rental',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    connectionString: process.env.DATABASE_URL
  }
};

module.exports = dbConfig;
