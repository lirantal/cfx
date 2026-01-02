import React from 'react'
import { Box, Text } from 'ink'
import { theme } from '../theme.js'

interface FileInfoProps {
  filename: string
  fileSize: number
  contentType: string
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${bytes} B`
}

export function FileInfo({ filename, fileSize, contentType }: FileInfoProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={theme.primaryColor}>{'› '}</Text>
        <Text bold>Uploading: </Text>
        <Text>{filename}</Text>
      </Box>
      <Box marginLeft={2} gap={1}>
        <Box borderStyle="round" borderColor="gray" paddingX={1}>
          <Text color="gray">{formatFileSize(fileSize)}</Text>
        </Box>
        <Box borderStyle="round" borderColor="gray" paddingX={1}>
          <Text color="gray">{contentType}</Text>
        </Box>
      </Box>
    </Box>
  )
}

