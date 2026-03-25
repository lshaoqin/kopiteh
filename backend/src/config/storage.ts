import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const SUPABASE_STORAGE_ENDPOINT = process.env.SUPABASE_STORAGE;
const SUPABASE_REGION = process.env.SUPABASE_REGION;
const SUPABASE_ACCESS_KEY_ID = process.env.SUPABASE_ACCESS_KEY_ID;
const SUPABASE_SECRET_ACCESS_KEY = process.env.SUPABASE_SECRET_ACCESS_KEY;
export const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME;

if (!SUPABASE_STORAGE_ENDPOINT) {
  throw new Error("Missing SUPABASE_STORAGE");
}

if (!SUPABASE_ACCESS_KEY_ID || !SUPABASE_SECRET_ACCESS_KEY) {
  throw new Error("Missing SUPABASE_ACCESS_KEY_ID / SUPABASE_SECRET_ACCESS_KEY");
}

if (!SUPABASE_BUCKET_NAME) {
  throw new Error("Missing SUPABASE_BUCKET_NAME");
}

if (!SUPABASE_REGION) {
  throw new Error("Missing SUPABASE_REGION");
}

if (!/\/storage\/v1\/s3\/?$/.test(SUPABASE_STORAGE_ENDPOINT)) {
  throw new Error("SUPABASE_STORAGE must point to the Supabase S3 endpoint ending with /storage/v1/s3");
}

const storageClient = new S3Client({
  region: SUPABASE_REGION,
  endpoint: SUPABASE_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: SUPABASE_ACCESS_KEY_ID,
    secretAccessKey: SUPABASE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const supabasePublicBaseUrl = SUPABASE_STORAGE_ENDPOINT
  .replace(/\/storage\/v1\/s3\/?$/, "/storage/v1/object/public")
  .replace(/\/$/, "");

export function getSupabasePublicObjectUrl(key: string) {
  const normalizedKey = key
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${supabasePublicBaseUrl}/${SUPABASE_BUCKET_NAME}/${normalizedKey}`;
}

export default storageClient;
