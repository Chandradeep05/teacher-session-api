/**
 * DEV UTILITY — Database Reset Script
 *
 * Drops the entire database and recreates all indexes.
 * Use this to get a clean state for testing.
 *
 * Usage:  npx ts-node scripts/drop-db.ts
 *
 * ⚠️  This is a destructive operation — all data will be lost.
 *     NOT wired into any npm script intentionally.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Import models so their schemas (and indexes) are registered
import '../src/models/User';
import '../src/models/Teacher';
import '../src/models/Session';

async function resetDB() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected, dropping database...');
  await mongoose.connection.db!.dropDatabase();
  console.log('Database dropped.');

  // Recreate all indexes (unique constraints, compound indexes)
  console.log('Recreating indexes...');
  await mongoose.connection.syncIndexes();
  console.log('Indexes created.');

  await mongoose.disconnect();
  console.log('✅ Done — clean DB with indexes ready.');
}

resetDB().catch(console.error);
