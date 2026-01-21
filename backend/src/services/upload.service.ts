import { PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import filebaseClient, { FILEBASE_BUCKET_NAME, FILEBASE_GATEWAY_URL } from '../config/cloudflare';
import crypto from 'crypto';
import path from 'path';

export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'images'
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: FILEBASE_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await filebaseClient.send(command);

    // Get the CID (IPFS hash) from the uploaded file
    const headCommand = new HeadObjectCommand({
      Bucket: FILEBASE_BUCKET_NAME,
      Key: fileName,
    });
    
    const headResponse = await filebaseClient.send(headCommand);
    const cid = headResponse.Metadata?.cid;

    if (!cid) {
      throw new Error('Failed to retrieve IPFS CID');
    }

    // Return IPFS gateway URL
    return `${FILEBASE_GATEWAY_URL}/${cid}`;
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