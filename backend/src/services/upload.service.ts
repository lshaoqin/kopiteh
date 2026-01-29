import { PutObjectCommand } from '@aws-sdk/client-s3';
import supabaseStorageClient, { SUPABASE_BUCKET_NAME, SUPABASE_PUBLIC_URL } from '../config/storage';
import crypto from 'crypto';
import path from 'path';

export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'assets'
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: SUPABASE_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Make the file publicly accessible
      ACL: 'public-read',
    });

    await supabaseStorageClient.send(command);

    // Return Supabase public URL for the uploaded file
    return `${SUPABASE_PUBLIC_URL}/${SUPABASE_BUCKET_NAME}/${fileName}`;
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'images'
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }
}

export default new UploadService();