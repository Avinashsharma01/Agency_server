import './config/index.js';
import configureCloudinary from './config/cloudinary.js';
import { uploadWithFallback } from './helpers/cloudinary.helper.js';
import path from 'path';

configureCloudinary();

const samplePath = path.resolve(process.cwd(), 'src', 'uploads', '9371f9e6-85e8-4514-b7dc-7c90937a187e.jpeg');

console.log("Testing uploadWithFallback on:", samplePath);

const result = await uploadWithFallback(samplePath, {
  folder: 'agency-cms/general',
  filename: '9371f9e6-85e8-4514-b7dc-7c90937a187e.jpeg',
});

console.log("FINAL RESULT OBJECT:");
console.log(JSON.stringify(result, null, 2));
