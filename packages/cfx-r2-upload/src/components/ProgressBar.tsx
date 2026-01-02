import React, { useState, useEffect } from 'react'
import { Box, Text, useStdout } from 'ink'
import { theme } from '../theme.js'

interface ProgressBarProps {
  percentage: number
  status: 'uploading' | 'complete'
}

const FILLED_CHAR = '█'
const EMPTY_CHAR = '░'
const PADDING = 1 // Account for box padding on each side

export function ProgressBar({ percentage, status }: ProgressBarProps): React.ReactElement {
  const { stdout } = useStdout()
  const [animationFrame, setAnimationFrame] = useState(0)
  
  // Get terminal width, default to 80 if not available
  const terminalWidth = stdout?.columns || 80
  // Calculate bar width: terminal width minus padding
  const barWidth = Math.max(20, terminalWidth - (PADDING * 2))
  
  // Animate the progress bar edge during upload
  useEffect(() => {
    if (status !== 'uploading') return
    
    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 4)
    }, 150)
    
    return () => clearInterval(interval)
  }, [status])

  const clampedPercentage = Math.min(100, Math.max(0, percentage))
  const filledWidth = Math.round((clampedPercentage / 100) * barWidth)
  const emptyWidth = barWidth - filledWidth

  const filled = FILLED_CHAR.repeat(filledWidth)
  const empty = EMPTY_CHAR.repeat(emptyWidth)

  const statusLabel = status === 'complete' ? 'TRANSFER COMPLETE' : 'UPLOADING'
  const statusColor = status === 'complete' ? theme.successColor : theme.primaryColor
  
  // Animated spinner characters
  const spinnerChars = ['◐', '◓', '◑', '◒']
  const spinner = status === 'uploading' ? spinnerChars[animationFrame] : '✔'

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color="gray">{spinner} </Text>
        <Text color={statusColor} bold>{statusLabel}</Text>
        <Box flexGrow={1} />
        <Text color={statusColor} bold>{Math.round(clampedPercentage)}%</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={theme.primaryColor}>{filled}</Text>
        <Text color="gray">{empty}</Text>
      </Box>
    </Box>
  )
}

