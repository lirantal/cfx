import { parseArgs } from 'node:util'
import { existsSync, statSync } from 'node:fs'
import { basename } from 'node:path'
import { render } from 'ink'
import { App } from './App.js'
import type { CliConfig, R2Credentials } from './types.js'

const HELP_TEXT = `
  CLOUDFLARE R2 UPLOAD CLI
  
  Upload files to Cloudflare R2 with style.

  USAGE
    $ r2-upload --file <path> --bucket <name> [options]

  OPTIONS
    -f, --file     Path to file to upload (required)
    -b, --bucket   Target R2 bucket name (required)
    -k, --key      Custom object key (defaults to filename)
    -r, --region   Region hint for display (default: WNAM)
    -h, --help     Show this help message

  ENVIRONMENT
    CLOUDFLARE_ACCOUNT_ID   Cloudflare Account ID
    R2_ACCESS_KEY_ID        R2 Access Key ID
    R2_SECRET_ACCESS_KEY    R2 Secret Access Key

  EXAMPLE
    $ r2-upload --file ./data.bin --bucket production-v4
`

function showHelp(): void {
  console.log(HELP_TEXT)
  process.exit(0)
}

function showError(message: string): void {
  console.error(`\n  ERROR: ${message}\n`)
  console.error('  Run with --help for usage information.\n')
  process.exit(1)
}

function getCredentials(): R2Credentials {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId) {
    showError('Missing CLOUDFLARE_ACCOUNT_ID environment variable')
  }
  if (!accessKeyId) {
    showError('Missing R2_ACCESS_KEY_ID environment variable')
  }
  if (!secretAccessKey) {
    showError('Missing R2_SECRET_ACCESS_KEY environment variable')
  }

  return {
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!
  }
}

function parseCliArgs(): CliConfig {
  const { values } = parseArgs({
    options: {
      file: { type: 'string', short: 'f' },
      bucket: { type: 'string', short: 'b' },
      key: { type: 'string', short: 'k' },
      region: { type: 'string', short: 'r', default: 'WNAM' },
      help: { type: 'boolean', short: 'h' }
    },
    strict: true,
    allowPositionals: false
  })

  if (values.help) {
    showHelp()
  }

  if (!values.file) {
    showError('Missing required argument: --file')
  }

  if (!values.bucket) {
    showError('Missing required argument: --bucket')
  }

  const filePath = values.file!
  
  if (!existsSync(filePath)) {
    showError(`File not found: ${filePath}`)
  }

  const stats = statSync(filePath)
  if (!stats.isFile()) {
    showError(`Not a file: ${filePath}`)
  }

  const key = values.key || basename(filePath)

  return {
    file: filePath,
    bucket: values.bucket!,
    key,
    region: values.region || 'WNAM'
  }
}

async function main(): Promise<void> {
  const config = parseCliArgs()
  const credentials = getCredentials()

  const { waitUntilExit } = render(
    <App config={config} credentials={credentials} />
  )

  await waitUntilExit()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

