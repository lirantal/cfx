/**
 * cfx-r2 - High-level Cloudflare R2 storage API wrapper
 * 
 * A TypeScript package that provides a clean, class-based interface for
 * interacting with Cloudflare R2 storage, wrapping aws4fetch for Workers
 * and browser compatibility.
 * 
 * @example
 * ```typescript
 * import { R2Client } from 'cfx-r2'
 * 
 * const r2 = new R2Client({
 *   accountId: 'abc123',
 *   accessKeyId: 'key',
 *   secretAccessKey: 'secret'
 * })
 * 
 * const bucket = r2.bucket('gallery')
 * const result = await bucket.presignedUploadUrl({
 *   key: 'file.jpg',
 *   contentType: 'image/jpeg'
 * })
 * ```
 */

export { R2Client } from './client.js'
export { R2Bucket } from './bucket.js'

export type {
  R2ClientConfig,
  PresignedUploadUrlOptions,
  PresignedDownloadUrlOptions,
  PresignedUrlResult,
  UploadFileOptions,
  UploadResult,
  R2Object,
  BucketInfo,
  BucketDetails,
} from './types.js'

