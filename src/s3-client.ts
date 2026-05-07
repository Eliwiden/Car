// b2-client.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
//import { v4 as uuid } from 'uuid';

interface B2Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
}

const config: B2Config = {
  endpoint: requiredEnv('B2_ENDPOINT'),
  region: requiredEnv('B2_REGION'),
  accessKeyId: requiredEnv('B2_ACCESS_KEY_ID'),
  secretAccessKey: requiredEnv('B2_SECRET_ACCESS_KEY'),
  bucket: requiredEnv('B2_BUCKET')
};

const s3Client = new S3Client({
  endpoint: config.endpoint,
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
  },
  forcePathStyle: true  // Обязательно для B2
});

export class Cs3API {

  // Загрузка файла
  public async uploadFile(key: string, body: Uint8Array | string, contentType?: string) {
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    });
    return await s3Client.send(command);
  }

  // Скачивание
  public async downloadFile(key: string): Promise<Uint8Array> {
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key
    });
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error(`No body found for key: ${key}`);
    }
    
    return await response.Body.transformToByteArray();
  }

  // Список файлов
  public async listFiles(prefix?: string): Promise<string[] | undefined> {
    const command = new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: prefix
    });
    const response = await s3Client.send(command);
    return response.Contents?.map(obj => obj.Key!);
  }

  // Удаление
  public async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key
    });
    return await s3Client.send(command);
  }
}