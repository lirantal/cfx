# cfx-r2-upload - Project Specification

A futuristic command-line interface for uploading files to Cloudflare R2 object storage with animated progress visualization.

## Overview

`cfx-r2-upload` is a TypeScript-based CLI tool that provides an elegant terminal user interface (TUI) for uploading files to Cloudflare R2. It leverages React Ink for rendering interactive components in the terminal, offering real-time progress tracking, animated feedback, and presigned URL generation.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| TypeScript | 5.x | Type-safe development |
| React | 18.x | Component architecture |
| Ink | 5.x | Terminal UI rendering |
| tsup | 8.x | Bundle and compile |
| cfx-r2 | workspace | R2 API client |

### Why These Choices

- **React Ink**: Provides a familiar React component model for building terminal interfaces. Enables declarative UI updates, state management with hooks, and component composition.

- **TypeScript**: Ensures type safety across CLI arguments, API responses, and component props. Catches errors at compile time.

- **tsup**: Fast, zero-config bundler that handles ESM output, TypeScript compilation, and adds the shebang for CLI execution.

- **Node.js built-in `util.parseArgs`**: Native argument parsing without external dependencies. Available since Node.js 18.3.0.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Entry                            │
│                        (cli.tsx)                             │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  util.parseArgs │  │   Credentials   │                   │
│  │   --file        │  │   from env vars │                   │
│  │   --bucket      │  │                 │                   │
│  │   --key         │  │                 │                   │
│  │   --region      │  │                 │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
│           │                    │                             │
│           └──────────┬─────────┘                             │
│                      ▼                                       │
│           ┌─────────────────────┐                            │
│           │     App Component   │                            │
│           │      (App.tsx)      │                            │
│           └──────────┬──────────┘                            │
│                      │                                       │
│    ┌─────────────────┼─────────────────┐                    │
│    ▼                 ▼                 ▼                    │
│ ┌──────┐      ┌───────────┐     ┌───────────┐              │
│ │Header│      │ProgressBar│     │LogMessages│              │
│ └──────┘      └───────────┘     └───────────┘              │
│ ┌──────┐      ┌───────────┐     ┌───────────┐              │
│ │Footer│      │   Stats   │     │SuccessRes │              │
│ └──────┘      └───────────┘     └───────────┘              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────┐
              │      cfx-r2         │
              │   (R2Client API)    │
              └─────────────────────┘
                           │
                           ▼
              ┌─────────────────────┐
              │   Cloudflare R2     │
              │   Object Storage    │
              └─────────────────────┘
```

## Directory Structure

```
packages/cfx-r2-upload/
├── dist/                   # Compiled output
│   ├── cli.js              # Bundled CLI with shebang
│   ├── cli.js.map          # Source map
│   └── cli.d.ts            # Type declarations
├── docs/
│   └── project.md          # This file
├── src/
│   ├── cli.tsx             # Entry point, argument parsing
│   ├── App.tsx             # Main application component
│   ├── types.ts            # TypeScript type definitions
│   └── components/
│       ├── index.ts        # Component exports
│       ├── Header.tsx      # Cloudflare R2 branding
│       ├── FileInfo.tsx    # File name and size display
│       ├── ProgressBar.tsx # Animated upload progress
│       ├── Stats.tsx       # Transfer rate and ETA
│       ├── LogMessages.tsx # Timestamped status messages
│       ├── Footer.tsx      # Bucket/encryption/region
│       └── SuccessResult.tsx # Upload result with URL
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Requirements

### Functional Requirements

1. **File Upload**: Upload any file from local filesystem to R2 bucket
2. **Custom Object Key**: Allow specifying custom object key (path in bucket)
3. **Progress Tracking**: Display upload progress percentage
4. **Transfer Stats**: Show transfer rate (MB/s) and estimated time
5. **Status Logging**: Display timestamped log messages during upload
6. **Presigned URL**: Generate and display download URL after upload
7. **Error Handling**: Graceful error display for failed uploads

### Non-Functional Requirements

1. **Visual Design**: Futuristic, elegant terminal aesthetic
2. **Animations**: Smooth progress bar and typing effects
3. **Responsiveness**: Real-time UI updates during upload
4. **Minimal Dependencies**: Use Node.js built-ins where possible
5. **Cross-Platform**: Work on Linux, macOS, Windows

## Features

### Command-Line Interface

```bash
r2-upload --file <path> --bucket <name> [options]

Options:
  -f, --file     Path to file to upload (required)
  -b, --bucket   Target R2 bucket name (required)
  -k, --key      Custom object key (defaults to filename)
  -r, --region   Region hint for display (default: WNAM)
  -h, --help     Show help message
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account identifier |
| `R2_ACCESS_KEY_ID` | Yes | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API secret key |

### TUI Components

#### Header
- Displays "CLOUDFLARE R2" branding with letter spacing
- Subtitle: "ULTRA-LOW LATENCY OBJECT STORAGE"
- Cyan color theme

#### FileInfo
- Shows filename being uploaded
- Displays formatted file size (B, KB, MB, GB)
- Rounded border badge for size

#### ProgressBar
- 40-character wide progress bar
- Filled (█) and empty (░) block characters
- Animated spinner during upload (◐◓◑◒)
- Checkmark (✔) on completion
- Percentage display

#### Stats
- Transfer rate in appropriate units (B/s to GB/s)
- Estimated time remaining
- Hidden after upload completes

#### LogMessages
- Timestamped entries [HH:MM:SS]
- Typing animation for latest message
- Prefix icons: › (info), ✔ (success), ✗ (error)
- Bordered container

#### Footer
- Bucket name display
- Encryption indicator (AES-256-GCM)
- Region with EDGE suffix

#### SuccessResult
- Double-bordered green container
- Object path (bucket/key)
- Full presigned download URL
- Truncates long URLs gracefully

## API Reference

### Types

```typescript
// CLI configuration from parsed arguments
interface CliConfig {
  file: string      // Path to file
  bucket: string    // Target bucket
  key: string       // Object key
  region: string    // Region hint
}

// R2 credentials from environment
interface R2Credentials {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
}

// Upload state machine
type UploadStatus = 
  | 'initializing'  // Setting up connection
  | 'uploading'     // Transfer in progress
  | 'complete'      // Successfully uploaded
  | 'error'         // Upload failed

// Log message entry
interface LogEntry {
  timestamp: string           // HH:MM:SS format
  message: string             // Log content
  type: 'info' | 'success' | 'error'
}

// Progress tracking
interface UploadProgress {
  bytesUploaded: number
  totalBytes: number
  percentage: number
  transferRate: number      // bytes/second
  estimatedTime: number     // seconds remaining
}
```

### Component Props

```typescript
// Header - no props
function Header(): React.ReactElement

// FileInfo
interface FileInfoProps {
  filename: string
  fileSize: number  // bytes
}

// ProgressBar
interface ProgressBarProps {
  percentage: number          // 0-100
  status: 'uploading' | 'complete'
}

// Stats
interface StatsProps {
  transferRate: number        // bytes/second
  estimatedTime: number       // seconds
}

// LogMessages
interface LogMessagesProps {
  logs: LogEntry[]
}

// Footer
interface FooterProps {
  bucket: string
  region: string
}

// SuccessResult
interface SuccessResultProps {
  objectKey: string
  bucket: string
  downloadUrl: string
}
```

## Upload Flow

```
1. Parse CLI arguments (util.parseArgs)
2. Validate required arguments
3. Check file exists and is readable
4. Load credentials from environment
5. Render Ink app with initial state
6. Initialize R2Client from cfx-r2
7. Read file into memory (Buffer → Blob)
8. Start simulated progress animation
9. Call bucket.uploadFile()
10. On success:
    - Update progress to 100%
    - Add success log entry
    - Generate presigned download URL
    - Display SuccessResult component
11. On error:
    - Display error message
    - Add error log entry
12. Exit process
```

## MIME Type Detection

The CLI automatically detects content type based on file extension:

| Extension | MIME Type |
|-----------|-----------|
| jpg, jpeg | image/jpeg |
| png | image/png |
| gif | image/gif |
| webp | image/webp |
| svg | image/svg+xml |
| pdf | application/pdf |
| json | application/json |
| txt | text/plain |
| html | text/html |
| css | text/css |
| js | application/javascript |
| ts | application/typescript |
| zip | application/zip |
| tar | application/x-tar |
| gz | application/gzip |
| mp4 | video/mp4 |
| mp3 | audio/mpeg |
| wav | audio/wav |
| (other) | application/octet-stream |

## Design Decisions

### Progress Simulation

The current implementation simulates progress because:
1. The underlying `fetch` API doesn't provide upload progress events
2. Node.js `fetch` implementation lacks progress callbacks
3. Future iterations could use `XMLHttpRequest` or streaming for real progress

### File Reading Strategy

Files are read entirely into memory before upload:
- Simple implementation
- Works for most file sizes
- **Limitation**: Large files (>2GB) may cause memory issues

### Presigned URL Expiration

Download URLs expire after 1 hour (3600 seconds):
- Reasonable default for immediate use
- Could be made configurable in future versions

## Future Improvements

### High Priority

1. **Real Progress Tracking**: Use streaming upload with progress events
2. **Large File Support**: Implement multipart upload for files >5GB
3. **Resume Support**: Save upload state for resumable transfers
4. **Configurable URL Expiration**: Add `--expires` flag

### Medium Priority

1. **Multiple File Upload**: Support glob patterns or multiple `--file` args
2. **Directory Upload**: Recursive directory upload with prefix
3. **Dry Run Mode**: Preview upload without executing
4. **JSON Output**: Machine-readable output format
5. **Quiet Mode**: Suppress TUI for scripting

### Low Priority

1. **Config File**: Load defaults from `.r2uploadrc`
2. **Bucket Creation**: Create bucket if doesn't exist
3. **Metadata Flags**: Custom metadata via CLI args
4. **Compression**: Gzip compression option
5. **Checksum Verification**: MD5/SHA256 integrity check

## Testing Strategy

### Manual Testing

```bash
# Test help
node dist/cli.js --help

# Test missing arguments
node dist/cli.js --file test.txt

# Test missing file
node dist/cli.js --file nonexistent.txt --bucket test

# Test actual upload (requires credentials)
export CLOUDFLARE_ACCOUNT_ID="..."
export R2_ACCESS_KEY_ID="..."
export R2_SECRET_ACCESS_KEY="..."
node dist/cli.js --file ./test.txt --bucket my-bucket
```

### Future: Automated Tests

- Unit tests for utility functions (formatFileSize, getMimeType)
- Component tests with ink-testing-library
- Integration tests with mock R2 client

## Build & Development

```bash
# Install dependencies
pnpm install

# Development with watch mode
pnpm dev

# Production build
pnpm build

# Type checking
pnpm typecheck
```

## Related Packages

- **cfx-r2**: Core R2 API wrapper used by this CLI
- **ink**: React renderer for terminal interfaces
- **ink-spinner**: Loading spinner components (available but not currently used)

## Version History

| Version | Changes |
|---------|---------|
| 0.1.0 | Initial release with basic upload functionality |

## License

MIT

