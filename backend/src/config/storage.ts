import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const FILEBASE_ACCESS_KEY_ID = process.env.FILEBASE_ACCESS_KEY_ID;
const FILEBASE_SECRET_ACCESS_KEY = process.env.FILEBASE_SECRET_ACCESS_KEY;
export const FILEBASE_BUCKET_NAME = process.env.FILEBASE_BUCKET_NAME;
export const FILEBASE_GATEWAY_URL = process.env.FILEBASE_GATEWAY_URL; // you have this

if (!FILEBASE_ACCESS_KEY_ID || !FILEBASE_SECRET_ACCESS_KEY) {
  throw new Error("Missing FILEBASE_ACCESS_KEY_ID / FILEBASE_SECRET_ACCESS_KEY");
}
if (!FILEBASE_BUCKET_NAME) {
  throw new Error("Missing FILEBASE_BUCKET_NAME");
}

const filebaseClient = new S3Client({
  region: "us-east-1",
  endpoint: "https://s3.filebase.com",
  credentials: {
    accessKeyId: FILEBASE_ACCESS_KEY_ID,
    secretAccessKey: FILEBASE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export default filebaseClient;