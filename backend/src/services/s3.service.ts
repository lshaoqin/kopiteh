import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function createPresignedUpload({
  filename,
  contentType,
  folder = "uploads",
}: {
  filename: string;
  contentType: string;
  folder?: string;
}) {
  const bucket = process.env.AWS_S3_BUCKET!;
  const ext = path.extname(filename) || "";
  const key = `${folder}/${crypto.randomUUID()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  const publicBase =
    process.env.AWS_S3_PUBLIC_URL ??
    `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;

  return { uploadUrl, publicUrl: `${publicBase}/${key}` };
}
