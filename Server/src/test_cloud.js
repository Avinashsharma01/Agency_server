import config from './config/index.js';
import configureCloudinary, { cloudinary } from './config/cloudinary.js';

configureCloudinary();

console.log('Testing Cloudinary config:', config.cloudinary);

try {
  const res = await cloudinary.uploader.upload('https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png', { folder: 'agency-cms/test' });
  console.log('✅ CLOUDINARY UPLOAD SUCCESS! URL:', res.secure_url);
} catch (error) {
  console.log('❌ CLOUDINARY UPLOAD ERROR:', error.message);
  console.dir(error);
}
