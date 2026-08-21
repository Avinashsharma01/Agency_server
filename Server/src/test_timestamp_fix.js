import './config/index.js';
import configureCloudinary, { cloudinary } from './config/cloudinary.js';
import path from 'path';
import fs from 'fs';

configureCloudinary();

const testFile = path.resolve(process.cwd(), 'src', 'uploads', '1362b04a-00ff-4c00-9b03-33105072ae79.png');

console.log("Current System Date:", new Date().toISOString());
console.log("Current System Timestamp (Sec):", Math.floor(Date.now() / 1000));

// Test 1: Upload with default system timestamp (Year 2026)
try {
  console.log("\n--- TEST 1: Default System Timestamp ---");
  const res1 = await cloudinary.uploader.upload(testFile, { folder: 'agency-cms/test' });
  console.log("✅ TEST 1 SUCCESS:", res1.secure_url);
} catch (err1) {
  console.log("❌ TEST 1 FAILED:", err1.message);
}

// Test 2: Upload with adjusted real UTC timestamp (~Feb 2025)
const REAL_UTC_APPROX_TIMESTAMP = Math.floor(Date.now() / 1000) - (547 * 86400); // subtract ~547 days
console.log("\nTesting with adjusted timestamp (Sec):", REAL_UTC_APPROX_TIMESTAMP, "-> Date:", new Date(REAL_UTC_APPROX_TIMESTAMP * 1000).toISOString());

try {
  console.log("\n--- TEST 2: Adjusted Real-World Timestamp ---");
  const res2 = await cloudinary.uploader.upload(testFile, {
    folder: 'agency-cms/test',
    timestamp: REAL_UTC_APPROX_TIMESTAMP,
  });
  console.log("✅ TEST 2 SUCCESS! Cloudinary URL:", res2.secure_url);
} catch (err2) {
  console.log("❌ TEST 2 FAILED:", err2.message);
}
