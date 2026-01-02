import React from 'react'
import { Box, Text } from 'ink'
import { theme } from '../theme.js'

interface SuccessResultProps {
  objectKey: string
  bucket: string
  downloadUrl: string
}

export function SuccessResult({ objectKey, bucket, downloadUrl }: SuccessResultProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color="gray">› OBJECT PATH: </Text>
        <Text color={theme.primaryColor}>{bucket}/{objectKey}</Text>
      </Box>
      <Box flexDirection="column">
        <Text color="gray">› DOWNLOAD URL:</Text>
        <Text color={theme.primaryColor}>{downloadUrl}</Text>
      </Box>
    </Box>
  )
}
