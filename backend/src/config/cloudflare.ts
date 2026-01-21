import { S3Client } from '@aws-sdk/client-s3';

// Filebase uses S3-compatible API
const filebaseClient = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://s3.filebase.com',
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY || '',
  },
});

export const FILEBASE_BUCKET_NAME = process.env.FILEBASE_BUCKET_NAME || '';
export const FILEBASE_GATEWAY_URL = process.env.FILEBASE_GATEWAY_URL || 'https://ipfs.filebase.io/ipfs';

export default filebaseClient;