import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import filebaseClient, { FILEBASE_BUCKET_NAME } from "../config/storage";
import crypto from "crypto";
import path from "path";

export class UploadService {
  async uploadImage(file: Express.Multer.File, folder: string = "uploads"): Promise<string> {
    const ext = path.extname(file.originalname) || ".jpg";
    const key = `${folder}/${crypto.randomUUID()}${ext}`;

    // 1) Upload to Filebase bucket
    await filebaseClient.send(
      new PutObjectCommand({
        Bucket: FILEBASE_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // 2) Return a signed URL so the browser can preview via <img src="...">
    const url = await getSignedUrl(
      filebaseClient,
      new GetObjectCommand({
        Bucket: FILEBASE_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 60 } // 1 hour
    );

    return url;
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder: string = "uploads"): Promise<string[]> {
    return Promise.all(files.map((f) => this.uploadImage(f, folder)));
  }
}

export default new UploadService();
