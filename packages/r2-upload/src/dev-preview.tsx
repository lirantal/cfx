#!/usr/bin/env node
/**
 * Dev preview script for testing components with dummy data
 * Run with: npx tsx src/dev-preview.tsx
 */

import React from 'react'
import { render, Box } from 'ink'
import { Header } from './components/Header.js'
import { FileInfo } from './components/FileInfo.js'
import { ProgressBar } from './components/ProgressBar.js'
import { Stats } from './components/Stats.js'
import { LogMessages } from './components/LogMessages.js'
import { SuccessResult } from './components/SuccessResult.js'
import type { LogEntry } from './types.js'

// Dummy data for preview
const dummyLogs: LogEntry[] = [
  { timestamp: '13:53:02', message: 'Initializing secure handshake with R2-E1...', type: 'info' },
  { timestamp: '13:53:03', message: 'Payload delivered. Starting edge-layer optimization.', type: 'info' },
  { timestamp: '13:53:05', message: 'Deployment finalized. Resource available at edge node.', type: 'success' },
]

const dummyDownloadUrl = 'https://your-account.r2.cloudflarestorage.com/production-v4/neural-net-weights.bin?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=abc123&X-Amz-Date=20260101T135305Z&X-Amz-Expires=3600&X-Amz-Signature=xyz789'

function Preview(): React.ReactElement {
  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      
      <FileInfo
        filename="neural-net-weights.bin"
        fileSize={4.2 * 1024 * 1024 * 1024} // 4.2 GB
        contentType="application/octet-stream"
      />
      
      <ProgressBar
        percentage={100}
        status="complete"
      />
      
      <Stats
        transferRate={842.4 * 1024 * 1024} // 842.4 MB/s
        estimatedTime={0}
      />
      
      <LogMessages logs={dummyLogs} bucket="production-v4" region="WNAM" />
      
      <SuccessResult
        objectKey="neural-net-weights.bin"
        bucket="production-v4"
        downloadUrl={dummyDownloadUrl}
      />
    </Box>
  )
}

render(<Preview />)

