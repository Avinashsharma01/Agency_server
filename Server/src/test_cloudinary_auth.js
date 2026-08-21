import './config/index.js';
import configureCloudinary, { cloudinary } from './config/cloudinary.js';
import path from 'path';
import fs from 'fs';

configureCloudinary();

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

// Create sample image file
const tempFile = path.resolve(process.cwd(), 'src', 'uploads', 'sample-test.png');
fs.writeFileSync(tempFile, 'fake-image-bytes');

try {
  const res = await cloudinary.uploader.upload(tempFile, {
    folder: 'test',
  });
  console.log("CLOUDINARY SUCCESS! URL:", res.secure_url);
} catch (err) {
  console.log("CLOUDINARY FAILED WITH ERROR:");
  console.log("Error Message:", err.message);
  console.log("Error Name:", err.name);
  console.log("HTTP Code:", err.http_code);
} finally {
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
}
