/**
 * CLI configuration from parsed arguments
 */
export interface CliConfig {
  /** Path to file to upload */
  file: string
  /** Target R2 bucket name */
  bucket: string
  /** Custom object key (defaults to filename) */
  key: string
  /** Region hint for display */
  region: string
}

/**
 * R2 credentials from environment variables
 */
export interface R2Credentials {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
}

/**
 * Upload state for the TUI
 */
export type UploadStatus = 
  | 'initializing'
  | 'uploading'
  | 'complete'
  | 'error'

/**
 * Log message entry
 */
export interface LogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error'
}

/**
 * Upload progress state
 */
export interface UploadProgress {
  bytesUploaded: number
  totalBytes: number
  percentage: number
  transferRate: number // bytes per second
  estimatedTime: number // seconds remaining
}

/**
 * Upload result after successful upload
 */
export interface UploadResult {
  key: string
  bucket: string
  downloadUrl: string
}

