/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'

export function InstallPrompt() {
  const [mounted, setMounted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window))
    setIsStandalone(mq.matches)
    setMounted(true)

    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (!mounted || isStandalone || !isIOS) return null

  return (
    <div className="mt-4 text-center">
      <p className="text-neutral-500 text-xs">
        To install, tap{' '}
        <span role="img" aria-label="share icon">⎋</span>
        {' '}then &quot;Add to Home Screen&quot;{' '}
        <span role="img" aria-label="plus icon">➕</span>
      </p>
    </div>
  )
}