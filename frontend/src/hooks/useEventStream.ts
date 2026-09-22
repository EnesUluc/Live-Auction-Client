import { useCallback, useEffect, useRef, useState } from 'react'

export type StreamStatus = 'idle' | 'connecting' | 'live' | 'ended' | 'error'

interface Options<T> {
  /** SSE event name set by SseEmitter.event().name(...) on the backend */
  event: string
  onMessage: (data: T) => void
  enabled?: boolean
  /**
   * Server-streaming RPCs that are meant to stay open (WatchAuctionRoom) should
   * reconnect; finite ones that complete on their own (GetAuctionHistory) should not.
   */
  reconnect?: boolean
  /** Fired every time a fresh connection is established, incl. reconnects. */
  onOpen?: () => void
}

const MAX_ATTEMPTS = 6
const backoffMs = (attempt: number) => Math.min(1000 * 2 ** attempt, 15000)

/**
 * Thin, cancellation-safe wrapper around EventSource.
 *
 * The browser's built-in auto-retry is disabled (we close on the first error)
 * so that reconnect policy lives here: the room stream backs off and retries,
 * the history stream simply reports that the gRPC stream completed.
 */
export function useEventStream<T>(url: string | null, options: Options<T>) {
  const { event, enabled = true, reconnect = false } = options

  const [status, setStatus] = useState<StreamStatus>('idle')
  const [attempt, setAttempt] = useState(0)
  const [nonce, setNonce] = useState(0)

  // Keep callbacks out of the effect deps so a re-render never tears the stream down.
  const onMessageRef = useRef(options.onMessage)
  const onOpenRef = useRef(options.onOpen)
  onMessageRef.current = options.onMessage
  onOpenRef.current = options.onOpen

  const restart = useCallback(() => {
    setAttempt(0)
    setNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!url || !enabled) {
      setStatus('idle')
      return
    }

    let source: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let disposed = false
    let tries = 0

    const open = () => {
      if (disposed) return
      setStatus('connecting')
      source = new EventSource(url)

      source.addEventListener('open', () => {
        if (disposed) return
        tries = 0
        setAttempt(0)
        setStatus('live')
        onOpenRef.current?.()
      })

      source.addEventListener(event, (e) => {
        if (disposed) return
        try {
          onMessageRef.current(JSON.parse((e as MessageEvent).data) as T)
        } catch {
          // A malformed frame must not kill an otherwise healthy stream.
        }
      })

      source.addEventListener('error', () => {
        if (disposed) return
        // Take over from the browser's implicit retry.
        source?.close()
        source = null

        if (!reconnect) {
          // Expected for a finite server stream: gRPC onCompleted → emitter.complete().
          setStatus('ended')
          return
        }

        if (tries >= MAX_ATTEMPTS) {
          setStatus('error')
          return
        }

        const delay = backoffMs(tries)
        tries += 1
        setAttempt(tries)
        setStatus('connecting')
        retryTimer = setTimeout(open, delay)
      })
    }

    open()

    return () => {
      disposed = true
      clearTimeout(retryTimer)
      source?.close()
    }
  }, [url, enabled, event, reconnect, nonce])

  return { status, attempt, restart }
}
