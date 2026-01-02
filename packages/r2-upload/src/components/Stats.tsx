import React from 'react'
import { Box, Text } from 'ink'

interface StatsProps {
  transferRate: number // bytes per second
  estimatedTime: number // seconds remaining
}

function formatTransferRate(bytesPerSecond: number): string {
  if (bytesPerSecond >= 1024 * 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024 * 1024)).toFixed(1)} GB/S`
  }
  if (bytesPerSecond >= 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/S`
  }
  if (bytesPerSecond >= 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/S`
  }
  return `${bytesPerSecond} B/S`
}

function formatTime(seconds: number): string {
  if (seconds < 1) return '< 1S'
  if (seconds < 60) return `${Math.round(seconds)}S`
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}M ${secs}S`
  }
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}H ${mins}M`
}

export function Stats({ transferRate, estimatedTime }: StatsProps): React.ReactElement {
  return (
    <Box justifyContent="space-between" marginY={0}>
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <Text color="gray">TRANSFER RATE: </Text>
        <Text color="white">{formatTransferRate(transferRate)}</Text>
      </Box>
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <Text color="gray">EST. TIME: </Text>
        <Text color="white">{formatTime(estimatedTime)}</Text>
      </Box>
    </Box>
  )
}

