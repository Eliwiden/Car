import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'B2_ENDPOINT',
  'B2_REGION', 
  'B2_KEY_ID',
  'B2_APP_KEY',
  'B2_BUCKET_NAME'
] as const;

// Валидация переменных окружения
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
  forcePathStyle: true, // Критично для Backblaze B2
});

export default s3Client;