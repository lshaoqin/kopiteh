import { PutObjectCommand } from "@aws-sdk/client-s3";
import storageClient, {
  SUPABASE_BUCKET_NAME,
  getSupabasePublicObjectUrl,
} from "../config/storage";
import crypto from "crypto";
import path from "path";

export class UploadService {
  async uploadImage(file: Express.Multer.File, folder: string = "uploads"): Promise<string> {
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
      })
    );

    return getSupabasePublicObjectUrl(key);
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder: string = "uploads"): Promise<string[]> {
    return Promise.all(files.map((f) => this.uploadImage(f, folder)));
  }
}

export default new UploadService();
