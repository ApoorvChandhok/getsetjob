const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');


async function main() {
  console.log('Connecting to database:', process.env.DATABASE_URL.substring(0, 30) + '...');
  
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  // Just execute a raw query to check connection
  try {
    const dbr = await client`SELECT 1 as result`;
    console.log('Database connected successfully!', dbr);
    client.end();
  } catch (err) {
    console.error('Database connection failed:', err);
    client.end();
  }
}

main().catch(console.error);
