//import { MultipartFile } from '@fastify/multipart';

import type { ObjectStorageClass } from '@aws-sdk/client-s3';

export interface FileInfo {
  Key: string;
  size?: number;
  lastModified?: Date;
  etag?: string;
  storageClass?: ObjectStorageClass;
}

export interface FileInfo {
  key: string;
  size?: number;
  LastModified?: Date;
  etag?: string;
  storageClass?: ObjectStorageClass;
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

export interface LoginData {
  password: string;
  userId: string;
}