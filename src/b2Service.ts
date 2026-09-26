import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  type _Object,
  type ListObjectsV2CommandOutput,
  type CompleteMultipartUploadCommandOutput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
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

  async listItems(path: string = '', maxKeys: number = 100)/*: Promise<ListItemsResponse>*/ {
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
      //console.log('ListObjectsV2Command response:', response);
      const folders = (response.CommonPrefixes || [])
        .map(p => p.Prefix)
        .filter(it => !!it);

      const files = (response.Contents || [])
        .filter((item): item is _Object => Boolean(item.Key) && item.Key !== normalizedPath)
        .map((item) => ({
          key: item.Key!,
          size: item.Size,
          lastModified: item.LastModified,
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
    } catch (error: any) {
      throw new Error(`Failed to list items: ${error.message}`);
    }
  }

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
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
      });

      const result = await parallelUpload.done() as CompleteMultipartUploadCommandOutput;

      return {
        key: fileName,
        location: result.Location,
        etag: result.ETag,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getFile(fileName: string): Promise<FileData> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      const response = await s3Client.send(command);

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

  async readTextFile(fileName: string): Promise<string> {
    try {
      const { data } = await this.getFile(fileName);
      return data.toString('utf-8');
    } catch (error: any) {
      throw new Error(`Failed to read text file: ${error.message}`);
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
    } catch (error: any) {
      throw new Error(`Failed to write text file: ${error.message}`);
    }
  }
}

export default new B2Service();