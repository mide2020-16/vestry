'use client'
import { useState, useEffect, useCallback } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions'
import { BellIcon } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

// ─── Component ────────────────────────────────────────────────────────────────

export function PushNotificationManager() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage]           = useState('')
  const [error, setError]               = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    async function registerServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
      } catch {
        setError('Failed to register service worker.')
      }
    }

    registerServiceWorker()
  }, [])

  const subscribeToPush = useCallback(async () => {
    // Fixed: validate VAPID key before use instead of silent undefined crash
    if (!VAPID_KEY) {
      setError('Push notifications are not configured.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY) as Uint8Array<ArrayBuffer>,
      })
      setSubscription(sub)
      await subscribeUser(JSON.parse(JSON.stringify(sub)))
    } catch {
      setError('Failed to enable notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribeFromPush = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    } catch {
      setError('Failed to turn off notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [subscription])

  const sendTestNotification = useCallback(async () => {
    // Fixed: guard against blank messages
    if (!subscription || !message.trim()) return

    setLoading(true)
    setError(null)

    try {
      await sendNotification(message)
      setMessage('')
    } catch {
      setError('Failed to send notification. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [subscription, message])

  return (
    <div className="max-w-md border bg-white/7 hover:border-gray-100 rounded-2xl p-8">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Fixed: removed conflicting static bg-zinc-950 that overrode conditional bg */}
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
          subscription ? 'bg-green-50' : 'bg-gray-100'
        }`}>
          <BellIcon className={`w-4 h-4 ${subscription ? 'text-green-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Push notifications</p>
          <p className={`text-xs ${subscription ? 'text-green-600' : 'text-gray-400'}`}>
            {subscription ? 'Active' : 'Off'}
          </p>
        </div>
        <div className={`w-2 h-2 rounded-full ${subscription ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>

      {/* Error banner */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {/* Subscribed state */}
      {subscription ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Test message..."
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="button"
              onClick={sendTestNotification}
              disabled={loading || !message.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
          <button
            type="button"
            onClick={unsubscribeFromPush}
            disabled={loading}
            className="w-full text-sm text-red-600 font-medium p-4 border border-red-100 rounded-lg hover:bg-red-50 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Turning off…' : 'Turn off notifications'}
          </button>
        </div>
      ) : (
        /* Unsubscribed state */
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Stay updated with event reminders, announcements, and check-in alerts.
          </p>
          <button
            type="button"
            onClick={subscribeToPush}
            disabled={loading}
            className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm rounded-lg border border-blue-100 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enabling…' : 'Enable notifications'}
          </button>
        </div>
      )}
    </div>
  )
}