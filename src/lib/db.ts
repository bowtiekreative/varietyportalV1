import { MongoClient, type Db, type Collection } from 'mongodb';

export type ScanRecord = {
  token: string;
  createdAt: Date;
  answers: Record<string, string>;
  assessment: {
    total: number;
    max: number;
    tier: 'A' | 'B' | 'C';
    route: string;
    providerIds: string[];
    regulated: boolean;
    dimensions: { id: string; label: string; score: number; why: string }[];
  };
  source: { ip?: string; referer?: string; userAgent?: string };
  notifiedAt?: Date;
};

export type BookingRecord = {
  token: string;
  createdAt: Date;
  name: string;
  email: string;
  company: string;
  context: string;
  scanToken?: string;
};

const uri = process.env.MONGO_URL || '';
const dbName = process.env.MONGO_DB || 'varietyportal';

let client: MongoClient | null = null;
let db: Db | null = null;

/** Returns null when no database is configured — the funnel still works and
 *  falls back to email-only delivery rather than losing the submission. */
export async function getDb(): Promise<Db | null> {
  if (!uri) return null;
  if (db) return db;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    db = client.db(dbName);
    await db.collection('scans').createIndex({ token: 1 }, { unique: true });
    await db.collection('scans').createIndex({ createdAt: -1 });
    await db.collection('bookings').createIndex({ token: 1 }, { unique: true });
    return db;
  } catch (err) {
    console.error('[db] connection failed:', (err as Error).message);
    db = null;
    client = null;
    return null;
  }
}

export async function scans(): Promise<Collection<ScanRecord> | null> {
  const d = await getDb();
  return d ? d.collection<ScanRecord>('scans') : null;
}

export async function bookings(): Promise<Collection<BookingRecord> | null> {
  const d = await getDb();
  return d ? d.collection<BookingRecord>('bookings') : null;
}
