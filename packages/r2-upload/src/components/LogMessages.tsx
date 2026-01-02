import React, { useState, useEffect, useRef } from 'react'
import { Box, Text } from 'ink'
import type { LogEntry } from '../types.js'
import { theme } from '../theme.js'
import { BucketInfo } from './BucketInfo.js'

interface LogMessagesProps {
  logs: LogEntry[]
  bucket: string
  region: string
}

interface AnimatedLogProps {
  entry: LogEntry
  isLatest: boolean
}

function AnimatedLog({ entry, isLatest }: AnimatedLogProps): React.ReactElement {
  // Skip animation for success/error messages - show them immediately
  const skipAnimation = entry.type === 'success' || entry.type === 'error'
  const initialChars = skipAnimation ? entry.message.length : (isLatest ? 0 : entry.message.length)
  
  const [displayedChars, setDisplayedChars] = useState(initialChars)
  const messageRef = useRef(entry.message)
  
  // Reset animation when message changes
  useEffect(() => {
    if (messageRef.current !== entry.message) {
      messageRef.current = entry.message
      setDisplayedChars(skipAnimation ? entry.message.length : 0)
    }
  }, [entry.message, skipAnimation])

  // When this entry is no longer the latest, show full message immediately
  useEffect(() => {
    if (!isLatest && displayedChars < entry.message.length) {
      setDisplayedChars(entry.message.length)
    }
  }, [isLatest, displayedChars, entry.message.length])

  useEffect(() => {
    if (skipAnimation || !isLatest || displayedChars >= entry.message.length) return

    const timeout = setTimeout(() => {
      setDisplayedChars((prev) => Math.min(prev + 3, entry.message.length))
    }, 15)

    return () => clearTimeout(timeout)
  }, [isLatest, displayedChars, entry.message.length, skipAnimation])

  const displayedMessage = entry.message.slice(0, displayedChars)
  const prefix = entry.type === 'success' ? '✔' : '›'
  const prefixColor = entry.type === 'success' ? theme.successColor : entry.type === 'error' ? 'red' : theme.primaryColor

  const showCursor = isLatest && !skipAnimation && displayedChars < entry.message.length

  return (
    <Box>
      <Text color="gray" dimColor>[{entry.timestamp}] </Text>
      <Text color={prefixColor}>{prefix} </Text>
      <Text>{displayedMessage}</Text>
      {showCursor && <Text color={theme.primaryColor}>▌</Text>}
    </Box>
  )
}

export function LogMessages({ logs, bucket, region }: LogMessagesProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginY={0} paddingY={1} paddingLeft={1} borderStyle="round" borderColor="gray">
      <BucketInfo bucket={bucket} region={region} />
      {logs.map((entry, index) => (
        <AnimatedLog
          key={`${entry.timestamp}-${index}`}
          entry={entry}
          isLatest={index === logs.length - 1}
        />
      ))}
      {logs.length === 0 && (
        <Text color="gray" dimColor>Waiting for connection...</Text>
      )}
    </Box>
  )
}

