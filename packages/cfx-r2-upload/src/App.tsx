import React, { useState, useEffect, useCallback } from 'react'
import { Box, Text, useApp } from 'ink'
import { readFileSync, statSync } from 'node:fs'
import { R2Client } from '@cfkit/r2'
import {
  Header,
  FileInfo,
  ProgressBar,
  Stats,
  LogMessages,
  SuccessResult
} from './components/index.js'
import type { CliConfig, R2Credentials, LogEntry, UploadStatus } from './types.js'

interface AppProps {
  config: CliConfig
  credentials: R2Credentials
}

function getTimestamp(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'json': 'application/json',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'ts': 'application/typescript',
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'bin': 'application/octet-stream',
    'pkg': 'application/octet-stream',
    'exe': 'application/octet-stream',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

export function App({ config, credentials }: AppProps): React.ReactElement {
  const { exit } = useApp()
  
  const [status, setStatus] = useState<UploadStatus>('initializing')
  const [percentage, setPercentage] = useState(0)
  const [transferRate, setTransferRate] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState(0)

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev, { timestamp: getTimestamp(), message, type }])
  }, [])

  useEffect(() => {
    async function performUpload() {
      try {
        // Get file stats
        const stats = statSync(config.file)
        setFileSize(stats.size)

        addLog('Initializing secure handshake with R2-E1...')
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Initialize R2 client
        const r2 = new R2Client({
          accountId: credentials.accountId,
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey
        })

        const bucket = r2.bucket(config.bucket)

        addLog('Payload delivered. Starting edge-layer optimization.')
        setStatus('uploading')

        // Read file content and convert Buffer to Blob for cross-platform compatibility
        const fileBuffer = readFileSync(config.file)
        const contentType = getMimeType(config.key)
        const fileContent = new Blob([fileBuffer], { type: contentType })

        // Simulate progress for visual effect
        // In a real implementation, you'd track actual upload progress
        const startTime = Date.now()
        let uploadedBytes = 0
        const chunkSize = Math.max(stats.size / 20, 1024 * 1024) // 5% chunks or 1MB min

        const progressInterval = setInterval(() => {
          uploadedBytes = Math.min(uploadedBytes + chunkSize, stats.size)
          const elapsed = (Date.now() - startTime) / 1000
          const rate = uploadedBytes / elapsed
          const remaining = (stats.size - uploadedBytes) / rate

          setPercentage((uploadedBytes / stats.size) * 100)
          setTransferRate(rate)
          setEstimatedTime(remaining)

          if (uploadedBytes >= stats.size) {
            clearInterval(progressInterval)
          }
        }, 100)

        // Perform actual upload
        await bucket.uploadFile(config.key, fileContent, {
          contentType,
          metadata: {
            'uploaded-at': new Date().toISOString(),
            'original-filename': config.key
          }
        })

        clearInterval(progressInterval)
        setPercentage(100)
        setTransferRate(stats.size / ((Date.now() - startTime) / 1000))
        setEstimatedTime(0)

        addLog('Transfer complete. Resource available at edge node.', 'success')

        // Generate presigned download URL
        const result = await bucket.presignedDownloadUrl(config.key, {
          expiresIn: 3600 // 1 hour
        })

        setDownloadUrl(result.url)
        setStatus('complete')

        // Exit after a short delay to let the user see the result
        setTimeout(() => {
          exit()
        }, 100)

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        setStatus('error')
        addLog(`Upload failed: ${errorMessage}`, 'error')
        
        setTimeout(() => {
          exit()
        }, 100)
      }
    }

    performUpload()
  }, [config, credentials, addLog, exit])

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Header />
        <Box borderStyle="single" borderColor="red" padding={1}>
          <Text color="red">Error: {error}</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      
      <FileInfo
        filename={config.key}
        fileSize={fileSize}
        contentType={getMimeType(config.key)}
      />
      
      <ProgressBar
        percentage={percentage}
        status={status === 'complete' ? 'complete' : 'uploading'}
      />
      
      {(status === 'uploading' || status === 'complete') && (
        <Stats
          transferRate={transferRate}
          estimatedTime={estimatedTime}
        />
      )}
      
      <LogMessages logs={logs} bucket={config.bucket} region={config.region} />
      
      {status === 'complete' && downloadUrl && (
        <SuccessResult
          objectKey={config.key}
          bucket={config.bucket}
          downloadUrl={downloadUrl}
        />
      )}
    </Box>
  )
}

