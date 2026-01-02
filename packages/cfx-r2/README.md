# cfx-r2

High-level Cloudflare R2 storage API wrapper for `aws4fetch`. Provides a clean, class-based interface for interacting with Cloudflare R2 storage in Workers and browser environments.

## Features

- 🚀 **Simple API**: Clean, intuitive interface that hides S3-compatible complexity
- 🔒 **Pre-signed URLs**: Generate secure, time-limited URLs for uploads and downloads
- ✅ **Type Safe**: Full TypeScript support with comprehensive type definitions
- 🌐 **Universal**: Works in Cloudflare Workers, browsers, and Node.js
- 📦 **Lightweight**: Minimal dependencies, only `aws4fetch` required

## Installation

```bash
npm install cfx-r2
# or
pnpm add cfx-r2
# or
yarn add cfx-r2
```

## Quick Start

```typescript
import { R2Client } from 'cfx-r2'

// Initialize client
const r2 = new R2Client({
  accountId: 'your-account-id',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key'
})

// Get a bucket
const bucket = r2.bucket('gallery')

// Generate pre-signed upload URL
const uploadUrl = await bucket.presignedUploadUrl({
  key: 'photo.jpg',
  contentType: 'image/jpeg',
  expiresIn: 3600
})

// Generate pre-signed download URL
const downloadUrl = await bucket.presignedDownloadUrl('photo.jpg', {
  expiresIn: 3600
})
```

## API Reference

### R2Client

Main client class for managing R2 connections.

#### Constructor

```typescript
const r2 = new R2Client({
  accountId: string      // Cloudflare Account ID
  accessKeyId: string    // R2 Access Key ID
  secretAccessKey: string // R2 Secret Access Key
})
```

#### Methods

##### `bucket(name: string): R2Bucket`

Get a bucket instance for performing operations.

```typescript
const bucket = r2.bucket('gallery')
```

##### `listBuckets(): Promise<BucketInfo[]>`

List all buckets in the account.

```typescript
const buckets = await r2.listBuckets()
// => [{ name: 'gallery', creationDate: Date, location: 'auto' }, { name: 'uploads', creationDate: Date, location: 'auto' }]
```

**Returns:**
```typescript
Array<{
  name: string
  creationDate?: Date
  location: string  // Always "auto" for R2 buckets
}>
```

### R2Bucket

Bucket-scoped operations interface.

#### `presignedUploadUrl(options): Promise<PresignedUrlResult>`

Generate a pre-signed URL for uploading an object.

```typescript
const result = await bucket.presignedUploadUrl({
  key: 'file.jpg',                    // Object key (required)
  contentType: 'image/jpeg',         // MIME type (required)
  metadata: {                         // Optional metadata
    'original-filename': 'photo.jpg'
  },
  expiresIn: 86400,                  // Expiration in seconds (default: 86400)
  maxFileSize: 10 * 1024 * 1024,     // Max size in bytes (optional)
  allowedContentTypes: ['image/*']    // Allowed types (optional)
})
```

**Returns:**
```typescript
{
  url: string              // Pre-signed URL
  key: string             // Object key
  contentType: string     // Content type
  expiresIn: number       // Expiration time
  metadata?: Record<string, string>
}
```

#### `presignedDownloadUrl(key, options?): Promise<PresignedUrlResult>`

Generate a pre-signed URL for downloading an object.

```typescript
const result = await bucket.presignedDownloadUrl('file.jpg', {
  expiresIn: 3600  // Expiration in seconds (default: 3600)
})
```

#### `exists(): Promise<boolean>`

Check if the bucket exists.

```typescript
const exists = await bucket.exists()
```

#### `objectExists(key: string): Promise<boolean>`

Check if an object exists in the bucket.

```typescript
const exists = await bucket.objectExists('file.jpg')
```

#### `getInfo(): Promise<BucketDetails>`

Get bucket information and metadata.

```typescript
const info = await bucket.getInfo()
// => { name: 'gallery', location: 'auto' }
```

**Returns:**
```typescript
{
  name: string
  creationDate?: Date
  location: string  // Typically "auto" for R2
}
```

#### `uploadFile(key, file, options): Promise<UploadResult>`

Upload a file directly to R2.

```typescript
const file = new File(['content'], 'file.jpg', { type: 'image/jpeg' })

const result = await bucket.uploadFile('file.jpg', file, {
  contentType: 'image/jpeg',
  metadata: {
    'original-filename': 'photo.jpg'
  }
})
```

**Supported file types:**
- `Blob`
- `File`
- `ArrayBuffer`
- `string`

**Returns:**
```typescript
{
  key: string
  contentType: string
  fileSize: number
  etag?: string
}
```

#### `deleteObject(key: string): Promise<void>`

Delete an object from the bucket.

```typescript
await bucket.deleteObject('file.jpg')
```

#### `getObject(key: string): Promise<R2Object & { body: Response }>`

Get an object from the bucket.

```typescript
const obj = await bucket.getObject('file.jpg')
const blob = await obj.body.blob()

console.log(obj.key)           // 'file.jpg'
console.log(obj.contentType)   // 'image/jpeg'
console.log(obj.size)          // File size in bytes
console.log(obj.metadata)      // Custom metadata
```

## Usage Examples

### Pre-signed Upload Flow

```typescript
import { R2Client } from 'cfx-r2'

const r2 = new R2Client({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
})

const bucket = r2.bucket('gallery')

// Generate pre-signed URL
const { url, key } = await bucket.presignedUploadUrl({
  key: 'photo.jpg',
  contentType: 'image/jpeg',
  metadata: {
    'original-filename': 'vacation-photo.jpg',
    'uploaded-by': 'user-123'
  },
  expiresIn: 3600
})

// Client uploads directly to R2
const response = await fetch(url, {
  method: 'PUT',
  headers: {
    'Content-Type': 'image/jpeg',
    'x-amz-meta-original-filename': 'vacation-photo.jpg',
    'x-amz-meta-uploaded-by': 'user-123'
  },
  body: file
})
```

### Direct Upload

```typescript
const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })

const result = await bucket.uploadFile('photo.jpg', file, {
  contentType: 'image/jpeg',
  metadata: {
    'original-filename': 'vacation-photo.jpg'
  }
})

console.log(`Uploaded ${result.key} (${result.fileSize} bytes)`)
```

### Content Type Validation

```typescript
try {
  const result = await bucket.presignedUploadUrl({
    key: 'document.pdf',
    contentType: 'application/pdf',
    allowedContentTypes: ['image/*']  // Only images allowed
  })
} catch (error) {
  console.error(error.message)
  // "Content type 'application/pdf' is not allowed. Allowed types: image/*"
}
```

### Check Object Existence

```typescript
const exists = await bucket.objectExists('photo.jpg')
if (exists) {
  const downloadUrl = await bucket.presignedDownloadUrl('photo.jpg')
  console.log('Download URL:', downloadUrl.url)
}
```

### List All Buckets

```typescript
const buckets = await r2.listBuckets()
console.log('Available buckets:', buckets.map(b => b.name))
// => ['gallery', 'uploads', 'backups']

// Each bucket includes name, creationDate, and location
buckets.forEach(bucket => {
  console.log(`${bucket.name} - created: ${bucket.creationDate}, location: ${bucket.location}`)
})
```

### Get Bucket Information

```typescript
const bucket = r2.bucket('gallery')
const info = await bucket.getInfo()
console.log(`Bucket ${info.name} location: ${info.location}`)
// => Bucket gallery location: auto
```

## TypeScript Support

The package includes full TypeScript definitions:

```typescript
import type {
  R2ClientConfig,
  PresignedUploadUrlOptions,
  PresignedDownloadUrlOptions,
  PresignedUrlResult,
  UploadFileOptions,
  UploadResult,
  R2Object,
  BucketInfo,
  BucketDetails
} from 'cfx-r2'
```

## Environment Compatibility

Works in:
- ✅ Cloudflare Workers
- ✅ Browser environments
- ✅ Node.js (18+ with native fetch)
- ✅ Deno
- ✅ Bun

## Requirements

- `fetch` API
- `Blob` API
- `crypto.subtle` (for aws4fetch)

## Error Handling

The package throws standard JavaScript `Error` objects:

```typescript
try {
  await bucket.uploadFile('file.jpg', file, { contentType: 'image/jpeg' })
} catch (error) {
  if (error instanceof Error) {
    console.error('Upload failed:', error.message)
  }
}
```

## Security Best Practices

1. **Never expose credentials** in client-side code
2. **Use appropriate expiration times** for pre-signed URLs
3. **Validate file types and sizes** before generating URLs
4. **Configure CORS** on your R2 bucket for direct client uploads
5. **Use metadata headers** to track uploads (user ID, timestamp, etc.)

## CORS Configuration

For direct client uploads, configure your R2 bucket CORS policy:

```json
{
  "rules": [
    {
      "allowed": {
        "methods": ["PUT", "GET", "POST", "DELETE"],
        "origins": ["https://yourdomain.com"],
        "headers": [
          "content-type",
          "x-amz-meta-original-filename",
          "x-amz-meta-uploaded-at",
          "x-amz-meta-uploaded-by"
        ]
      },
      "exposeHeaders": ["ETag"],
      "maxAgeSeconds": 3000
    }
  ]
}
```

**Note:** Cloudflare R2 requires explicit header names (wildcards like `["*"]` are not supported).

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

