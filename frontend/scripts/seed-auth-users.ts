import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

import { auth } from '../lib/auth.ts';
import { Pool } from 'pg';

const DEMO_ACCOUNTS = [
  { email: 'reviewer@bharatprecision.example', name: 'Priya Sharma', role: 'Compliance / Legal Reviewer' },
  { email: 'admin@bharatprecision.example', name: 'Rajesh Mehta', role: 'Organisation Admin' },
  { email: 'hr@bharatprecision.example', name: 'Anita Desai', role: 'Department User' },
  { email: 'tcc-admin@thecollectivecounsel.example', name: 'TCC Platform Admin', role: 'TCC Platform Admin' },
];

async function seed() {
  console.log('Seeding demo accounts via auth.api.signUpEmail...');
  for (const acc of DEMO_ACCOUNTS) {
    try {
      await auth.api.signUpEmail({
        body: {
          email: acc.email,
          password: 'Demo@2026!',
          name: acc.name,
        },
      });
      console.log('Created auth user:', acc.email);
    } catch (err: any) {
      console.log('User note (' + acc.email + '):', err.message || err);
    }
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  for (const acc of DEMO_ACCOUNTS) {
    await pool.query('UPDATE "user" SET role = $1 WHERE email = $2', [acc.role, acc.email]);
  }

  const result = await pool.query('SELECT email, name, role FROM "user"');
  console.log('Seeded users in database:');
  console.table(result.rows);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
