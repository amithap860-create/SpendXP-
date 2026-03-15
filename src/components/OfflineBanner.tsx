'use client'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * @fileOverview Passive UI banner that appears when the user is offline.
 * Communicates that the app's persistent cache is still functional.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      suppressHydrationWarning
      style={{
        background: '#854F0B', // Brown/Amber warning color
        color: '#FAEEDA',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'relative',
        width: '100%',
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      You are offline. SpendXP is running in offline mode — your progress will sync when you reconnect.
    </div>
  )
}
