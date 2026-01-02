# cfx-r2 Package Specification

## Overview

`cfx-r2` is a high-level TypeScript npm package that abstracts Cloudflare R2's S3-compatible APIs into a clean, class-based interface. The package wraps `aws4fetch` to provide Workers and browser-compatible APIs for pre-signed URL generation, bucket management, and object operations.

## Design Goals

1. **Simplicity**: Provide a clean, intuitive API that hides the complexity of S3-compatible signing
2. **Compatibility**: Work seamlessly in Cloudflare Workers and browser environments
3. **Type Safety**: Full TypeScript support with comprehensive type definitions
4. **Flexibility**: Support both pre-signed URLs (for direct client uploads) and direct server-side operations
5. **Validation**: Built-in support for content type and file size validation

## Architecture

### Class Hierarchy

```
R2Client
  ├── Manages AWS client and credentials
  ├── Provides bucket factory method
  └── R2Bucket
       ├── Pre-signed URL generation (upload/download)
       ├── Object operations (upload, delete, get)
       └── Existence checks (bucket, object)
```

### Key Components

1. **R2Client**: Main entry point that manages credentials and AWS client instance
2. **R2Bucket**: Bucket-scoped operations interface
3. **Types**: Comprehensive TypeScript interfaces for all operations

## API Design

### Client Initialization

```typescript
const r2 = new R2Client({
  accountId: 'abc123',
  accessKeyId: 'key',
  secretAccessKey: 'secret'
})
```

### Bucket Operations

All operations are scoped to a bucket instance:

```typescript
const bucket = r2.bucket('gallery')
```

This design provides:
- Clear separation of concerns
- Easy testing (mock bucket instances)
- Fluent API that reads naturally

## Core Capabilities

### 1. Pre-signed Upload URLs

Generate time-limited URLs for direct client uploads:

```typescript
const result = await bucket.presignedUploadUrl({
  key: 'file.jpg',
  contentType: 'image/jpeg',
  metadata: { 'original-filename': 'photo.jpg' },
  expiresIn: 3600,
  maxFileSize: 10 * 1024 * 1024,
  allowedContentTypes: ['image/*']
})
```

**Features:**
- Query string signing for URL-based authentication
- Content type validation (supports wildcards)
- File size validation (documentation only, not enforced by R2)
- Custom metadata headers
- Configurable expiration

### 2. Pre-signed Download URLs

Generate time-limited URLs for secure object access:

```typescript
const result = await bucket.presignedDownloadUrl('file.jpg', {
  expiresIn: 3600
})
```

**Features:**
- Query string signing
- Configurable expiration (default: 1 hour)
- No authentication required for end users

### 3. Bucket Existence Check

```typescript
const exists = await bucket.exists()
```

**Implementation Notes:**
- Uses HEAD request to bucket root
- May not be fully reliable with S3-compatible API
- Consider using Cloudflare R2 REST API for production

### 4. Object Existence Check

```typescript
const exists = await bucket.objectExists('file.jpg')
```

**Implementation:**
- Uses HEAD request to object
- Returns boolean (true if 200 OK, false otherwise)

### 5. Direct File Upload

Upload files directly from server-side code:

```typescript
const result = await bucket.uploadFile('file.jpg', fileContent, {
  contentType: 'image/jpeg',
  metadata: { 'original-filename': 'photo.jpg' }
})
```

**Features:**
- Supports Blob, File, ArrayBuffer, or string
- Automatic content type handling
- Metadata header support
- Returns upload result with ETag

### 6. Object Deletion

```typescript
await bucket.deleteObject('file.jpg')
```

**Features:**
- Silent success (404 is treated as success)
- Throws on other errors

### 7. Object Retrieval

```typescript
const obj = await bucket.getObject('file.jpg')
const blob = await obj.body.blob()
```

**Features:**
- Returns object metadata and Response body
- Extracts custom metadata headers
- Full access to object content

## Technical Decisions

### 1. ESM-Only Package

- Uses `"type": "module"` in package.json
- All imports use `.js` extensions (TypeScript requirement)
- Compatible with modern bundlers and runtimes

### 2. aws4fetch Dependency

- Workers-compatible (uses SubtleCrypto, not Node.js crypto)
- Browser-compatible
- No DOMParser dependency (unlike AWS SDK v3)

### 3. Query String Signing

- Pre-signed URLs use query string signing (`signQuery: true`)
- Direct operations use header signing
- Matches Cloudflare R2 best practices

### 4. Header Signing

- Uses `allHeaders: true` for PUT operations
- Ensures Content-Type and metadata headers are included in signature
- Prevents signature mismatch errors

### 5. Metadata Handling

- Automatically prefixes metadata keys with `x-amz-meta-`
- Preserves existing `x-amz-meta-` prefixes
- Extracts metadata from response headers

## URL Construction

R2 URLs follow this pattern:

```
https://{accountId}.r2.cloudflarestorage.com/{bucket}/{key}
```

The package constructs these URLs internally based on:
- Account ID (from client config)
- Bucket name (from bucket instance)
- Object key (from operation parameters)

## Error Handling

The package throws standard JavaScript Error objects with descriptive messages:

- Validation errors (content type, file size)
- Network errors (fetch failures)
- R2 API errors (non-2xx responses)

## Validation

### Content Type Validation

Supports wildcard patterns:

```typescript
allowedContentTypes: ['image/*', 'application/pdf']
```

- `image/*` matches `image/jpeg`, `image/png`, etc.
- Exact matches: `application/pdf` matches only `application/pdf`

### File Size Validation

- Documented in response but not enforced by R2
- Applications should validate file size before upload
- Useful for API documentation and client-side validation

## Security Considerations

1. **Credentials**: Never expose credentials in client-side code
2. **Pre-signed URLs**: Use appropriate expiration times
3. **Metadata**: Be careful with sensitive data in metadata headers
4. **CORS**: Configure R2 bucket CORS policy for direct client uploads

## Testing Strategy

1. **Unit Tests**: Mock aws4fetch and fetch APIs
2. **Integration Tests**: Use test R2 bucket (if available)
3. **Type Tests**: Ensure TypeScript types are correct

## Future Enhancements

Potential additions (not in initial version):

1. **List Objects**: Paginated object listing
2. **Copy Object**: Server-side object copying
3. **Multipart Upload**: Large file upload support
4. **Batch Operations**: Multiple object operations
5. **Streaming**: Stream upload/download support

## Migration from Backend Code

The package abstracts patterns from the existing backend implementation:

**Before:**
```typescript
const aws = new AwsClient({ ... })
const url = `https://${accountId}.r2.cloudflarestorage.com/gallery/${key}`
const signed = await aws.sign(url, { method: 'PUT', ... })
```

**After:**
```typescript
const r2 = new R2Client({ ... })
const bucket = r2.bucket('gallery')
const result = await bucket.presignedUploadUrl({ key, contentType, ... })
```

## Dependencies

- **aws4fetch**: ^1.0.20 - Workers-compatible AWS signing library
- **TypeScript**: ^5.9.3 - Type definitions and compilation
- **tsup**: ^8.0.0 - ESM bundler

## Browser/Workers Compatibility

The package is designed to work in:
- ✅ Cloudflare Workers
- ✅ Browser environments
- ✅ Node.js (with fetch polyfill)
- ✅ Deno
- ✅ Bun

All environments must support:
- `fetch` API
- `Blob` API
- `crypto.subtle` (for aws4fetch)

