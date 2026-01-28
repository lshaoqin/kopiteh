import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Supabase project reference - extract from SUPABASE_URL or use env var
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'rthdjygvrwxujpwldyjm'; //public bucket url

export const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'assets';

// Public URL for accessing files
export const SUPABASE_PUBLIC_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public`;

const supabaseStorageClient = new S3Client({
  region: process.env.SUPABASE_REGION || 'ap-southeast-1',
  endpoint: `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/s3`,
  credentials: {
    accessKeyId: process.env.ACCESS_ID_KEY || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

export default supabaseStorageClient;
