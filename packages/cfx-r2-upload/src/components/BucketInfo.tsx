import React from 'react'
import { Box, Text } from 'ink'
import { theme } from '../theme.js'

interface BucketInfoProps {
  bucket: string
  region: string
}

export function BucketInfo({ bucket, region }: BucketInfoProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color="gray">◘ BUCKET: </Text>
        <Text color={theme.primaryColor}>{bucket}</Text>
      </Box>
      <Box>
        <Text color="gray">◈ REGION: </Text>
        <Text color={theme.primaryColor}>{region}</Text>
      </Box>
    </Box>
  )
}

