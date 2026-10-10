import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3ServiceException,
  type _Object,
  type ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from './config_b2.js';
import {
  UploadResponse,
  FileData,
  FileMetadata,
  FileInfo,
} from './types.js';

type ListItemsResponse = {
  files: FileInfo[];
  folders: string[];
  nextContinuationToken?: string;
  isTruncated?: boolean;
};

class B2Service {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.B2_BUCKET_NAME!;
  }

  private logError(operation: string, error: unknown): void {
    if (error instanceof S3ServiceException) {
      console.error(`B2 ${operation} failed:`, {
        name: error.name,
        message: error.message,
        httpStatusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
        extendedRequestId: error.$metadata?.extendedRequestId,
        fault: error.$fault,
        stack: error.stack,
      });
      return;
    }

    console.error(`B2 ${operation} failed with non-S3 error:`, error);
  }

  private getB2ErrorMessage(operation: string, error: unknown): string {
    if (error instanceof S3ServiceException) {
      const status = error.$metadata?.httpStatusCode;
      return `B2 ${operation} failed: ${error.name} (${status ?? 'unknown status'}): ${error.message}`;
    }

    if (error instanceof Error) {
      return `B2 ${operation} failed: ${error.message}`;
    }

    return `B2 ${operation} failed: unknown error`;
  }

  async listItems(path: string = '', maxKeys: number = 100): Promise<ListItemsResponse> {
    try {
      const normalizedPath =
        path && !path.endsWith('/') ? `${path}/` : path;

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: normalizedPath,
        Delimiter: '/',
        MaxKeys: maxKeys,
      });

      const response: ListObjectsV2CommandOutput = await s3Client.send(command);

      const folders = (response.CommonPrefixes || [])
        .map(prefix => prefix.Prefix)
        .filter((prefix): prefix is string => Boolean(prefix));

      const files = (response.Contents || [])
        .filter((item): item is _Object =>
          Boolean(item.Key) && item.Key !== normalizedPath
        )
        .map(item => ({
          Key: item.Key!,
          key: item.Key!,
          size: item.Size,
          lastModified: item.LastModified,
          LastModified: item.LastModified,
          etag: item.ETag,
          storageClass: item.StorageClass,
        }));

      if (path && folders.length === 0 && files.length === 0) {
        throw new Error(`Folder not found: ${path}`);
      }

      return {
        files,
        folders,
        nextContinuationToken: response.NextContinuationToken,
        isTruncated: response.IsTruncated,
      };
    } catch (error: unknown) {
      this.logError('listItems', error);
      throw new Error(this.getB2ErrorMessage('listItems', error));
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<UploadResponse> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      const result = await s3Client.send(command);

      return {
        key: fileName,
        etag: result.ETag,
      };
    } catch (error: unknown) {
      this.logError('uploadFile', error);
      throw new Error(this.getB2ErrorMessage('uploadFile', error));
    }
  }

  async getFile(fileName: string): Promise<FileData> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        throw new Error(`Empty response body for file: ${fileName}`);
      }
      const data = await response.Body.transformToByteArray();

      return {
        data: Buffer.from(data),
        contentType: response.ContentType,
        contentLength: response.ContentLength,
      };
    } catch (error: unknown) {
      this.logError('getFile', error);
      throw new Error(this.getB2ErrorMessage('getFile', error));
    }
  }

  async getSignedDownloadUrl(
    fileName: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error: unknown) {
      this.logError('getSignedDownloadUrl', error);
      throw new Error(this.getB2ErrorMessage('getSignedDownloadUrl', error));
    }
  }

  async deleteFile(fileName: string): Promise<{ deleted: boolean; key: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await s3Client.send(command);

      return {
        deleted: true,
        key: fileName,
      };
    } catch (error: unknown) {
      this.logError('deleteFile', error);
      throw new Error(this.getB2ErrorMessage('deleteFile', error));
    }
  }

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
    } catch (error: unknown) {
      this.logError('getFileMetadata', error);
      throw new Error(this.getB2ErrorMessage('getFileMetadata', error));
    }
  }

  async readTextFile(fileName: string): Promise<string> {
    try {
      const { data } = await this.getFile(fileName);
      return data.toString('utf-8');
    } catch (error: unknown) {
      this.logError('readTextFile', error);
      throw new Error(this.getB2ErrorMessage('readTextFile', error));
    }
  }

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
    } catch (error: unknown) {
      this.logError('writeTextFile', error);
      throw new Error(this.getB2ErrorMessage('writeTextFile', error));
    }
  }
}

export default new B2Service();