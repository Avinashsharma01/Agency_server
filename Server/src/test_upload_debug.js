import config from './config/index.js';
import configureCloudinary, { cloudinary } from './config/cloudinary.js';
import fs from 'fs';
import path from 'path';

configureCloudinary();

// Create a small test image file
const testFilePath = path.resolve(process.cwd(), 'src', 'uploads', 'test-sample.png');
if (!fs.existsSync(path.dirname(testFilePath))) {
  fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
}
fs.writeFileSync(testFilePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));

console.log('Testing Cloudinary upload with config:', {
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
});

try {
  const result = await cloudinary.uploader.upload(testFilePath, {
    folder: 'agency-cms/test',
  });
  console.log('✅ UPLOAD SUCCESS! Secure URL:', result.secure_url);
} catch (error) {
  console.log('❌ UPLOAD FAILED!');
  console.log('Error message:', error.message);
  console.log('Error http_code:', error.http_code);
  console.log('Full error object:', JSON.stringify(error, null, 2));
} finally {
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
}
