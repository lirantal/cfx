import React from 'react'
import { Box, Text } from 'ink'
import { theme } from '../theme.js'

export function Header(): React.ReactElement {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box justifyContent="center">
        <Text bold color={theme.primaryColor}>
          C L O U D F L A R E   R 2
        </Text>
      </Box>
      <Box justifyContent="center">
        <Text color="gray" dimColor>
          ULTRA-LOW LATENCY OBJECT STORAGE
        </Text>
      </Box>
    </Box>
  )
}

