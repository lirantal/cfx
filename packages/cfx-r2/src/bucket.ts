import { AwsClient } from 'aws4fetch'
import type {
  PresignedUploadUrlOptions,
  PresignedDownloadUrlOptions,
  PresignedUrlResult,
  UploadFileOptions,
  UploadResult,
  R2Object,
  BucketDetails,
} from './types.js'

/**
 * R2Bucket provides operations for a specific R2 bucket.
 * 
 * @example
 * ```typescript
 * const bucket = r2.bucket('gallery')
 * const result = await bucket.presignedUploadUrl({
 *   key: 'file.jpg',
 *   contentType: 'image/jpeg'
 * })
 * ```
 */
export class R2Bucket {
  constructor(
    private readonly name: string,
    private readonly awsClient: AwsClient,
    private readonly baseUrl: string
  ) {}

  /**
   * Get the bucket name.
   */
  getName(): string {
    return this.name
  }

  /**
   * Get bucket information and metadata.
   * Uses the S3-compatible GetBucketLocation API.
   * 
   * @returns Bucket details including name and location
   * 
   * @example
   * ```typescript
   * const info = await bucket.getInfo()
   * // => { name: 'gallery', location: 'auto' }
   * ```
   */
  async getInfo(): Promise<BucketDetails> {
    // GET /{bucket}?location returns location constraint
    const bucketUrl = `${this.baseUrl}/${this.name}?location`
    const signedRequest = await this.awsClient.sign(bucketUrl, {
      method: 'GET',
      aws: {
        signQuery: false,
      },
    })

    const response = await fetch(signedRequest.url, {
      method: 'GET',
      headers: signedRequest.headers,
    })

    if (!response.ok) {
      throw new Error(
        `Get bucket info failed: ${response.status} ${response.statusText}`
      )
    }

    const xml = await response.text()
    const location = this.parseLocationXml(xml)

    return {
      name: this.name,
      location,
    }
  }

  /**
   * Parse location from GetBucketLocation XML response.
   * @internal
   */
  private parseLocationXml(xml: string): string {
    // GetBucketLocation returns <LocationConstraint>auto</LocationConstraint>
    // or empty string if not set (which means us-east-1, but R2 uses "auto")
    const location = xml.match(/<LocationConstraint>([^<]*)<\/LocationConstraint>/)?.[1]?.trim()
    return location || 'auto'
  }

  /**
   * Generate a pre-signed URL for uploading an object.
   * 
   * @param options - Upload URL options
   * @returns Pre-signed URL and metadata
   * 
   * @example
   * ```typescript
   * const result = await bucket.presignedUploadUrl({
   *   key: 'file.jpg',
   *   contentType: 'image/jpeg',
   *   metadata: { 'original-filename': 'photo.jpg' },
   *   expiresIn: 3600,
   *   maxFileSize: 10 * 1024 * 1024,
   *   allowedContentTypes: ['image/*']
   * })
   * ```
   */
  async presignedUploadUrl(
    options: PresignedUploadUrlOptions
  ): Promise<PresignedUrlResult> {
    const {
      key,
      contentType,
      metadata = {},
      expiresIn = 86400, // 24 hours default
      maxFileSize,
      allowedContentTypes,
    } = options

    // Validate content type if restrictions are specified
    if (allowedContentTypes && allowedContentTypes.length > 0) {
      const isAllowed = allowedContentTypes.some((pattern) => {
        if (pattern.endsWith('/*')) {
          const baseType = pattern.slice(0, -2)
          return contentType.startsWith(baseType + '/')
        }
        return contentType === pattern
      })

      if (!isAllowed) {
        throw new Error(
          `Content type '${contentType}' is not allowed. Allowed types: ${allowedContentTypes.join(', ')}`
        )
      }
    }

    // Build headers for signing
    const headers: Record<string, string> = {
      'Content-Type': contentType,
    }

    // Add metadata headers with x-amz-meta- prefix
    for (const [metaKey, metaValue] of Object.entries(metadata)) {
      const headerKey = metaKey.startsWith('x-amz-meta-')
        ? metaKey
        : `x-amz-meta-${metaKey}`
      headers[headerKey] = String(metaValue)
    }

    // Construct the bucket URL
    const bucketUrl = `${this.baseUrl}/${this.name}/${key}`

    // Sign the request with query string signing
    const signedRequest = await this.awsClient.sign(bucketUrl, {
      method: 'PUT',
      headers,
      aws: {
        signQuery: true,
        expires: expiresIn,
        // Ensure headers like Content-Type are included in the signature
        allHeaders: true,
      } as { signQuery: boolean; expires: number; allHeaders: boolean },
    })

    return {
      url: signedRequest.url,
      key,
      contentType,
      expiresIn,
      metadata: options.metadata,
      // Include validation hints in the result (for documentation purposes)
      ...(maxFileSize && { maxFileSize }),
      ...(allowedContentTypes && { allowedContentTypes }),
    } as PresignedUrlResult
  }

  /**
   * Generate a pre-signed URL for downloading an object.
   * 
   * @param key - Object key (filename)
   * @param options - Download URL options
   * @returns Pre-signed URL and metadata
   * 
   * @example
   * ```typescript
   * const result = await bucket.presignedDownloadUrl('file.jpg', {
   *   expiresIn: 3600
   * })
   * ```
   */
  async presignedDownloadUrl(
    key: string,
    options: PresignedDownloadUrlOptions = {}
  ): Promise<PresignedUrlResult> {
    const { expiresIn = 3600 } = options // 1 hour default

    // Construct the bucket URL
    const bucketUrl = `${this.baseUrl}/${this.name}/${key}`

    // Sign the request with query string signing for GET
    const signedRequest = await this.awsClient.sign(bucketUrl, {
      method: 'GET',
      aws: {
        signQuery: true,
        expires: expiresIn,
      } as { signQuery: boolean; expires: number },
    })

    return {
      url: signedRequest.url,
      key,
      contentType: '', // Not available from GET pre-signed URL
      expiresIn,
    }
  }

  /**
   * Check if the bucket exists.
   * 
   * @returns true if bucket exists, false otherwise
   * 
   * @example
   * ```typescript
   * const exists = await bucket.exists()
   * ```
   */
  async exists(): Promise<boolean> {
    try {
      // Try to list objects (HEAD bucket is not available in S3-compatible API)
      // We'll try a HEAD request to the bucket root
      const bucketUrl = `${this.baseUrl}/${this.name}/`
      const signedRequest = await this.awsClient.sign(bucketUrl, {
        method: 'HEAD',
        aws: {
          signQuery: false,
        },
      })

      const response = await fetch(signedRequest.url, {
        method: 'HEAD',
        headers: signedRequest.headers,
      })

      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Check if an object exists in the bucket.
   * 
   * @param key - Object key (filename)
   * @returns true if object exists, false otherwise
   * 
   * @example
   * ```typescript
   * const exists = await bucket.objectExists('file.jpg')
   * ```
   */
  async objectExists(key: string): Promise<boolean> {
    try {
      const bucketUrl = `${this.baseUrl}/${this.name}/${key}`
      const signedRequest = await this.awsClient.sign(bucketUrl, {
        method: 'HEAD',
        aws: {
          signQuery: false,
        },
      })

      const response = await fetch(signedRequest.url, {
        method: 'HEAD',
        headers: signedRequest.headers,
      })

      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Upload a file directly to R2.
   * 
   * @param key - Object key (filename)
   * @param file - File content (Blob, File, ArrayBuffer, or string)
   * @param options - Upload options
   * @returns Upload result with metadata
   * 
   * @example
   * ```typescript
   * const file = new File(['content'], 'file.jpg', { type: 'image/jpeg' })
   * const result = await bucket.uploadFile('file.jpg', file, {
   *   contentType: 'image/jpeg',
   *   metadata: { 'original-filename': 'photo.jpg' }
   * })
   * ```
   */
  async uploadFile(
    key: string,
    file: Blob | File | ArrayBuffer | string,
    options: UploadFileOptions
  ): Promise<UploadResult> {
    const { contentType, metadata = {} } = options

    // Convert file to Blob if needed
    let blob: Blob
    if (file instanceof Blob) {
      blob = file
    } else if (file instanceof ArrayBuffer) {
      blob = new Blob([file], { type: contentType })
    } else if (typeof file === 'string') {
      blob = new Blob([file], { type: contentType })
    } else {
      blob = file
    }

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': contentType,
    }

    // Add metadata headers
    for (const [metaKey, metaValue] of Object.entries(metadata)) {
      const headerKey = metaKey.startsWith('x-amz-meta-')
        ? metaKey
        : `x-amz-meta-${metaKey}`
      headers[headerKey] = String(metaValue)
    }

    // Construct the bucket URL
    const bucketUrl = `${this.baseUrl}/${this.name}/${key}`

    // Sign the request
    const signedRequest = await this.awsClient.sign(bucketUrl, {
      method: 'PUT',
      headers,
      body: blob,
      aws: {
        signQuery: false,
        allHeaders: true,
      },
    })

    // Upload the file
    const response = await fetch(signedRequest.url, {
      method: 'PUT',
      headers: signedRequest.headers,
      body: blob,
    })

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      )
    }

    const etag = response.headers.get('ETag')?.replace(/"/g, '') || undefined

    return {
      key,
      contentType,
      fileSize: blob.size,
      etag,
    }
  }

  /**
   * Delete an object from the bucket.
   * 
   * @param key - Object key (filename)
   * @returns void
   * 
   * @example
   * ```typescript
   * await bucket.deleteObject('file.jpg')
   * ```
   */
  async deleteObject(key: string): Promise<void> {
    const bucketUrl = `${this.baseUrl}/${this.name}/${key}`
    const signedRequest = await this.awsClient.sign(bucketUrl, {
      method: 'DELETE',
      aws: {
        signQuery: false,
      },
    })

    const response = await fetch(signedRequest.url, {
      method: 'DELETE',
      headers: signedRequest.headers,
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(
        `Delete failed: ${response.status} ${response.statusText}`
      )
    }
  }

  /**
   * Get an object from the bucket.
   * 
   * @param key - Object key (filename)
   * @returns Object metadata and content
   * 
   * @example
   * ```typescript
   * const obj = await bucket.getObject('file.jpg')
   * const blob = await obj.body.blob()
   * ```
   */
  async getObject(key: string): Promise<R2Object & { body: Response }> {
    const bucketUrl = `${this.baseUrl}/${this.name}/${key}`
    const signedRequest = await this.awsClient.sign(bucketUrl, {
      method: 'GET',
      aws: {
        signQuery: false,
      },
    })

    const response = await fetch(signedRequest.url, {
      method: 'GET',
      headers: signedRequest.headers,
    })

    if (!response.ok) {
      throw new Error(
        `Get object failed: ${response.status} ${response.statusText}`
      )
    }

    const contentType = response.headers.get('Content-Type') || undefined
    const contentLength = response.headers.get('Content-Length')
    const lastModified = response.headers.get('Last-Modified')
    const etag = response.headers.get('ETag')?.replace(/"/g, '') || undefined

    // Extract metadata from x-amz-meta- headers
    const metadata: Record<string, string> = {}
    for (const [headerName, headerValue] of response.headers.entries()) {
      if (headerName.toLowerCase().startsWith('x-amz-meta-')) {
        const metaKey = headerName
          .toLowerCase()
          .replace('x-amz-meta-', '')
        metadata[metaKey] = headerValue
      }
    }

    return {
      key,
      contentType,
      size: contentLength ? parseInt(contentLength, 10) : 0,
      lastModified: lastModified ? new Date(lastModified) : new Date(),
      etag,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      body: response,
    }
  }
}

