import { AwsClient } from 'aws4fetch'
import type { R2ClientConfig, BucketInfo } from './types.js'
import { R2Bucket } from './bucket.js'

/**
 * R2Client provides a high-level interface for interacting with Cloudflare R2 storage.
 * 
 * @example
 * ```typescript
 * const r2 = new R2Client({
 *   accountId: 'abc123',
 *   accessKeyId: 'key',
 *   secretAccessKey: 'secret'
 * })
 * 
 * const bucket = r2.bucket('gallery')
 * ```
 */
export class R2Client {
  private readonly awsClient: AwsClient
  private readonly baseUrl: string

  constructor(config: R2ClientConfig) {
    this.awsClient = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      service: 's3',
      region: 'auto',
    })
    this.baseUrl = `https://${config.accountId}.r2.cloudflarestorage.com`
  }

  /**
   * Get a bucket instance for performing operations on a specific bucket.
   * 
   * @param name - The name of the bucket
   * @returns An R2Bucket instance for the specified bucket
   * 
   * @example
   * ```typescript
   * const bucket = r2.bucket('gallery')
   * await bucket.presignedUploadUrl({ key: 'file.jpg', contentType: 'image/jpeg' })
   * ```
   */
  bucket(name: string): R2Bucket {
    return new R2Bucket(name, this.awsClient, this.baseUrl)
  }

  /**
   * List all buckets in the account.
   * Uses the S3-compatible ListBuckets API (GET /).
   * 
   * @returns Array of bucket information with names, creation dates, and location
   * 
   * @example
   * ```typescript
   * const buckets = await r2.listBuckets()
   * // => [{ name: 'gallery', creationDate: Date, location: 'auto' }, { name: 'uploads', creationDate: Date, location: 'auto' }]
   * ```
   */
  async listBuckets(): Promise<BucketInfo[]> {
    // GET / returns XML with bucket list
    const signedRequest = await this.awsClient.sign(this.baseUrl, {
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
        `List buckets failed: ${response.status} ${response.statusText}`
      )
    }

    const xml = await response.text()
    return this.parseBucketsXml(xml)
  }

  /**
   * Parse XML response from ListBuckets API.
   * @internal
   */
  private parseBucketsXml(xml: string): BucketInfo[] {
    const buckets: BucketInfo[] = []

    // Extract all <Bucket> elements
    const bucketMatches = xml.matchAll(/<Bucket>([\s\S]*?)<\/Bucket>/g)

    for (const match of bucketMatches) {
      const bucketXml = match[1]
      const name = this.parseXmlTag(bucketXml, 'Name')
      const creationDateStr = this.parseXmlTag(bucketXml, 'CreationDate')

      if (name) {
        buckets.push({
          name,
          creationDate: creationDateStr
            ? new Date(creationDateStr)
            : undefined,
          location: 'auto', // All R2 buckets are in the "auto" region
        })
      }
    }

    return buckets
  }

  /**
   * Parse a simple XML tag value.
   * @internal
   */
  private parseXmlTag(xml: string, tag: string): string | null {
    const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))
    return match ? match[1].trim() : null
  }

  /**
   * Get the base URL for R2 operations.
   * @internal
   */
  getBaseUrl(): string {
    return this.baseUrl
  }

  /**
   * Get the AWS client instance.
   * @internal
   */
  getAwsClient(): AwsClient {
    return this.awsClient
  }
}

