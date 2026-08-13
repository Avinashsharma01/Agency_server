import connectDatabase, { disconnectDatabase } from '../src/config/database.js';

beforeAll(async () => {
  await connectDatabase();
}, 15000);

afterAll(async () => {
  await disconnectDatabase();
}, 10000);
