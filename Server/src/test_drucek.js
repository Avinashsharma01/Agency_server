import './config/index.js';
import configureCloudinary, { cloudinary } from './config/cloudinary.js';
import path from 'path';

configureCloudinary();

console.log("Testing with Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

const samplePath = path.resolve(process.cwd(), 'src', 'uploads', '9371f9e6-85e8-4514-b7dc-7c90937a187e.jpeg');

try {
  const result = await cloudinary.uploader.upload(samplePath, {
    folder: 'agency-cms/test',
  });
  console.log("🎉 SUCCESS! Live Cloudinary URL:", result.secure_url);
} catch (error) {
  console.log("❌ ERROR:", error.message);
}
