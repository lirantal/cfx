/**
 * Configuration for R2Client initialization
 */
export interface R2ClientConfig {
  /** Cloudflare Account ID */
  accountId: string
  /** R2 Access Key ID */
  accessKeyId: string
  /** R2 Secret Access Key */
  secretAccessKey: string
}

/**
 * Options for generating pre-signed upload URLs
 */
export interface PresignedUploadUrlOptions {
  /** Object key (filename) in the bucket */
  key: string
  /** Content type (MIME type) of the file */
  contentType: string
  /** Optional metadata headers to include */
  metadata?: Record<string, string>
  /** Expiration time in seconds (default: 86400 = 24 hours) */
  expiresIn?: number
  /** Maximum allowed file size in bytes (validation only, not enforced by R2) */
  maxFileSize?: number
  /** Allowed content types (supports wildcards like 'image/*') */
  allowedContentTypes?: string[]
}

/**
 * Options for generating pre-signed download URLs
 */
export interface PresignedDownloadUrlOptions {
  /** Expiration time in seconds (default: 3600 = 1 hour) */
  expiresIn?: number
}

/**
 * Result from generating a pre-signed URL
 */
export interface PresignedUrlResult {
  /** The pre-signed URL */
  url: string
  /** Object key */
  key: string
  /** Content type */
  contentType: string
  /** Expiration time in seconds */
  expiresIn: number
  /** Metadata that was included in the signature */
  metadata?: Record<string, string>
}

/**
 * Options for uploading a file directly
 */
export interface UploadFileOptions {
  /** Content type (MIME type) of the file */
  contentType: string
  /** Optional metadata headers */
  metadata?: Record<string, string>
}

/**
 * Result from uploading a file
 */
export interface UploadResult {
  /** Object key */
  key: string
  /** Content type */
  contentType: string
  /** File size in bytes */
  fileSize: number
  /** ETag from R2 response */
  etag?: string
}

/**
 * R2 Object metadata
 */
export interface R2Object {
  /** Object key */
  key: string
  /** Content type */
  contentType?: string
  /** File size in bytes */
  size: number
  /** Last modified date */
  lastModified: Date
  /** ETag */
  etag?: string
  /** Custom metadata */
  metadata?: Record<string, string>
}

/**
 * Bucket information
 */
export interface BucketInfo {
  /** Bucket name */
  name: string
  /** Creation date */
  creationDate?: Date
  /** Bucket location constraint (typically "auto" for R2) */
  location: string
}

/**
 * Detailed bucket information including location
 */
export interface BucketDetails {
  /** Bucket name */
  name: string
  /** Creation date */
  creationDate?: Date
  /** Bucket location constraint (typically "auto" for R2) */
  location: string
}

