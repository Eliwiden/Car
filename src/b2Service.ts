import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from './config_b2.js';
import { 
  FileListResponse, 
  UploadResponse, 
  FileData, 
  FileMetadata, 
  FileInfo
} from './types.js';

class B2Service {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.B2_BUCKET_NAME!;
  }

  /**
   * Получение списка файлов в бакете
   */
  async listFiles(prefix: string = '', maxKeys: number = 100): Promise<FileListResponse> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        //MaxKeys: maxKeys,
		Delimiter:"\/"
      });

		const response = await s3Client.send(command);
		console.log(response);
		const folderList = response.CommonPrefixes || [];
		const files:FileInfo[] = [];
		for(const folder of folderList){
			const command2 = new ListObjectsV2Command({
				Bucket: this.bucketName,
				Prefix: folder.Prefix,
				Delimiter:"\/"
			});
			const response2 = await s3Client.send(command2);
			console.log(response2);

			for(const file of (response2.Contents || [])){
				files.push(file);
			}
		}
		return {
			files,
			nextContinuationToken: response.NextContinuationToken,
			isTruncated: response.IsTruncated,
		};
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Загрузка файла в бакет
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<UploadResponse> {
    try {
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
      };

      const parallelUpload = new Upload({
        client: s3Client,
        params: uploadParams,
        queueSize: 4, // Параллельная загрузка частей
        partSize: 5 * 1024 * 1024, // 5 MB
      });

      const result = await parallelUpload.done();
      
      return {
        key: result.Key,
        location: result.Location,
        etag: result.ETag,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Получение файла из бакета
   */
  async getFile(fileName: string): Promise<FileData> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      const response = await s3Client.send(command);
      
      // Конвертация стрима в буфер
      const chunks: Buffer[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      
      return {
        data: buffer,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
      };
    } catch (error: any) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * Генерация подписанной ссылки для скачивания
   */
  async getSignedDownloadUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error: any) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Удаление файла из бакета
   */
  async deleteFile(fileName: string): Promise<{ deleted: boolean; key: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await s3Client.send(command);
      
      return { deleted: true, key: fileName };
    } catch (error: any) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Получение метаданных файла
   */
  async getFileMetadata(fileName: string): Promise<FileMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      const response = await s3Client.send(command);
      
      return {
        key: fileName,
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
        etag: response.ETag,
        metadata: response.Metadata,
      };
    } catch (error: any) {
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Чтение текстового файла
   */
  async readTextFile(fileName: string): Promise<string> {
    try {
      const { data } = await this.getFile(fileName);
      return data.toString('utf-8');
    } catch (error: any) {
      throw new Error(`Failed to read text file: ${error.message}`);
    }
  }

  /**
   * Запись в текстовый файл
   */
  async writeTextFile(fileName: string, content: string): Promise<UploadResponse> {
    try {
      const buffer = Buffer.from(content, 'utf-8');
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: 'text/plain',
      });

      const result = await s3Client.send(command);
      
      return {
        key: fileName,
        etag: result.ETag,
      };
    } catch (error: any) {
      throw new Error(`Failed to write text file: ${error.message}`);
    }
  }
}

export default new B2Service();