'use client'
import { useState, useEffect } from 'react'

/**
 * @fileOverview Hook to monitor the browser's online/offline status.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined'
      ? window.navigator.onLine
      : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline, { passive: true })
    window.addEventListener('offline', handleOffline, { passive: true })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
