# cfx-r2-upload

A futuristic CLI tool for uploading files to Cloudflare R2 with animated progress bars and a polished terminal UI.

## Features

- Elegant futuristic TUI with animated progress bars
- Real-time transfer rate and ETA display
- Timestamped log messages with typing animation
- Presigned download URL generation on successful upload
- Built on React Ink for smooth terminal rendering

## Installation

```bash
npm install cfx-r2-upload
# or
pnpm add cfx-r2-upload
# or
yarn add cfx-r2-upload
```

## Prerequisites

Set the following environment variables for R2 authentication:

```bash
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export R2_ACCESS_KEY_ID="your-access-key-id"
export R2_SECRET_ACCESS_KEY="your-secret-access-key"
```

## Usage

```bash
r2-upload --file <path> --bucket <name> [options]
```

### Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--file` | `-f` | Path to file to upload | Yes |
| `--bucket` | `-b` | Target R2 bucket name | Yes |
| `--key` | `-k` | Custom object key (defaults to filename) | No |
| `--region` | `-r` | Region hint for display (default: WNAM) | No |
| `--help` | `-h` | Show help message | No |

### Examples

Upload a file with default object key:

```bash
r2-upload --file ./data.bin --bucket production-v4
```

Upload with custom object key:

```bash
r2-upload -f ./local-image.png -b assets -k images/hero.png
```

Specify region for display:

```bash
r2-upload --file ./backup.tar.gz --bucket backups --region ENAM
```

## Output

The CLI displays:

- **Header**: Cloudflare R2 branding
- **File Info**: Filename and size
- **Progress Bar**: Animated upload progress with percentage
- **Stats**: Transfer rate and estimated time remaining
- **Log Messages**: Timestamped status updates
- **Footer**: Bucket, encryption, and region info
- **Result**: Object path and presigned download URL on completion

## Example Output

```
C L O U D F L A R E   R 2
ULTRA-LOW LATENCY OBJECT STORAGE

› Uploading: neural-net-weights.bin  [4.2 GB]

✔ COMPLETE                                                95%
████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░

TRANSFER RATE: 842.4 MB/S                    EST. TIME: 4.2S

[13:53:02] › Initializing secure handshake with R2-E1...
[13:53:02] › Payload delivered. Starting edge-layer optimization.
[13:53:05] ✔ Deployment finalized. Resource available at edge node.

◘ BUCKET          ○ ENCRYPTION       ◈ REGION
production-v4     AES-256-GCM        WNAM (EDGE)

╔═══════════════════════════════════════════════════════════╗
║                    UPLOAD COMPLETE                         ║
║                                                             ║
║  OBJECT PATH                                               ║
║  production-v4/neural-net-weights.bin                      ║
║                                                             ║
║  PRESIGNED DOWNLOAD URL                                    ║
║  https://...r2.cloudflarestorage.com/...                  ║
║                                                             ║
╚═══════════════════════════════════════════════════════════╝
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | R2 API Access Key ID |
| `R2_SECRET_ACCESS_KEY` | R2 API Secret Access Key |

## Development

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Watch for changes
pnpm dev

# Type check
pnpm typecheck
```

## Dependencies

- [@cfkit/r2](../r2) - Cloudflare R2 API wrapper
- [ink](https://github.com/vadimdemedes/ink) - React for CLI
- [ink-spinner](https://github.com/vadimdemedes/ink-spinner) - Spinner component

## License

MIT

