//import { MultipartFile } from '@fastify/multipart';

export interface FileInfo {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
}

export interface FileListResponse {
  files: FileInfo[];
  nextContinuationToken?: string;
  isTruncated?: boolean;
}

export interface UploadResponse {
  key?: string;
  location?: string;
  etag?: string;
}

export interface FileData {
  data: Buffer;
  contentType?: string;
  contentLength?: number;
}

export interface FileMetadata {
  key: string;
  size?: number;
  contentType?: string;
  lastModified?: Date;
  etag?: string;
  metadata?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadFileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface FileQueryParams {
  prefix?: string;
  maxKeys?: string;
}

export interface UrlQueryParams {
  expiresIn?: string;
}

export interface FileParams {
  fileName: string;
}

export interface WriteFileBody {
  fileName: string;
  content: string;
}