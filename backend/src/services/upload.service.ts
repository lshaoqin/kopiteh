import { PutObjectCommand } from "@aws-sdk/client-s3";
import storageClient, {
  SUPABASE_BUCKET_NAME,
  getSupabasePublicObjectUrl,
} from "../config/storage";
import crypto from "crypto";
import path from "path";

export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = "uploads",
  ): Promise<string> {
    const ext = path.extname(file.originalname) || ".jpg";
    const normalizedFolder = folder.replace(/^\/+|\/+$/g, "") || "uploads";
    const key = `${normalizedFolder}/${crypto.randomUUID()}${ext}`;

    await storageClient.send(
      new PutObjectCommand({
        Bucket: SUPABASE_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return getSupabasePublicObjectUrl(key);
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = "uploads",
  ): Promise<string[]> {
    return Promise.all(files.map((f) => this.uploadImage(f, folder)));
  }

  async uploadBase64Image(
    dataUri: string,
    folder: string = "uploads",
  ): Promise<string> {
    // Parse the data URI
    const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid data URI format");
    }

    const mimeType = matches[1]; // e.g. "image/jpeg"
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Derive extension from mime type
    const ext = "." + mimeType.split("/")[1].replace("jpeg", "jpg");
    const normalizedFolder = folder.replace(/^\/+|\/+$/g, "") || "uploads";
    const key = `${normalizedFolder}/${crypto.randomUUID()}${ext}`;

    await storageClient.send(
      new PutObjectCommand({
        Bucket: SUPABASE_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return getSupabasePublicObjectUrl(key);
  }
}

export default new UploadService();
