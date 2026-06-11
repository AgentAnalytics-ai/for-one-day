'use client'

import { useCallback, useEffect, useState } from 'react'
import { Calendar, Check, ExternalLink, Loader2, Unlink } from 'lucide-react'
import { getGoogleCalendarStatus } from '@/app/actions/calendar-actions'

export function CalendarSettings() {
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getGoogleCalendarStatus>> | null>(
    null
  )
  const [banner, setBanner] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getGoogleCalendarStatus()
    setStatus(result)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const calendar = params.get('calendar')
    if (calendar === 'connected') {
      setBanner('Google Calendar connected. Today and This week will show your schedule.')
    } else if (calendar === 'denied') {
      setBanner('Google access was not granted. You can try again anytime.')
    } else if (calendar === 'unconfigured') {
      setBanner('Calendar connect is not configured on the server yet.')
    }
    if (calendar) {
      params.delete('calendar')
      const hash = window.location.hash || '#profile'
      const next = `${window.location.pathname}${hash}${params.toString() ? `?${params}` : ''}`
      window.history.replaceState(null, '', next)
    }
  }, [load])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/calendar/google/disconnect', { method: 'POST' })
      if (!res.ok) {
        setBanner('Could not disconnect. Try again.')
        return
      }
      setBanner('Google Calendar disconnected.')
      await load()
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#5C6478]" />
      </div>
    )
  }

  const connected = status?.connected ?? false

  return (
    <section className="space-y-4" aria-labelledby="calendar-settings-heading">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100/80 text-primary-900">
          <Calendar className="h-5 w-5" />
        </span>
        <div>
          <h2 id="calendar-settings-heading" className="section-title text-lg">
            Your calendar
          </h2>
          <p className="mt-1 text-sm text-[#5C6478]">
            Connect Google to merge your schedule on Today and This week. Each person connects their
            own account — spouse calendars combine for the home.
          </p>
        </div>
      </div>

      {banner ? (
        <div className="rounded-xl border border-primary-200 bg-primary-50/80 px-4 py-3 text-sm text-primary-900">
          {banner}
        </div>
      ) : null}

      {!status?.configured ? (
        <div className="rounded-xl border border-dashed border-[#E7E2DA] bg-[#FAF7F2]/60 px-4 py-4 text-sm text-[#5C6478]">
          Admin: add <code className="text-xs">GOOGLE_CALENDAR_CLIENT_ID</code> and{' '}
          <code className="text-xs">GOOGLE_CALENDAR_CLIENT_SECRET</code> to Vercel, then enable
          Calendar API in Google Cloud.
        </div>
      ) : null}

      {connected ? (
        <div className="rounded-2xl border border-[#E7E2DA] bg-white px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-900">
            <Check className="h-4 w-4 text-emerald-600" />
            Google Calendar connected
          </div>
          {status?.email ? (
            <p className="mt-1 text-sm text-[#5C6478]">{status.email}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex gap-2"
            >
              Open Google Calendar
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="inline-flex items-center gap-2 rounded-full border border-[#E7E2DA] px-4 py-2 text-sm font-medium text-[#5C6478] hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              <Unlink className="h-4 w-4" />
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#E7E2DA] bg-[#FAF7F2]/50 px-4 py-5">
          {status?.canConnect ? (
            <>
              <p className="text-sm text-[#5C6478]">
                Read-only access — we show events on your household wall and phone, not edit them
                here.
              </p>
              <a href="/api/calendar/google/connect" className="btn-primary mt-4 inline-flex">
                Connect Google Calendar
              </a>
            </>
          ) : (
            <p className="text-sm text-[#5C6478]">
              Pro unlocks shared schedule for your home.{' '}
              <a href="/upgrade" className="font-medium text-primary-900 hover:underline">
                Upgrade your household
              </a>
            </p>
          )}
        </div>
      )}
    </section>
  )
}
