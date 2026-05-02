import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface ToastMessage {
  title: string
  description: string
}

export function toast(message: ToastMessage) {
  window.dispatchEvent(new CustomEvent('football-toast', { detail: message }))
}

export function Toaster() {
  const [message, setMessage] = useState<ToastMessage | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      setMessage((event as CustomEvent<ToastMessage>).detail)
      window.setTimeout(() => setMessage(null), 3600)
    }
    window.addEventListener('football-toast', handler)
    return () => window.removeEventListener('football-toast', handler)
  }, [])

  if (!message) {
    return null
  }

  return (
    <div className="fixed right-4 top-20 z-[80] flex max-w-sm items-start gap-3 rounded-lg border border-destructive/30 bg-background p-4 text-sm shadow-lg">
      <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
      <div>
        <p className="font-semibold">{message.title}</p>
        <p className="text-muted-foreground">{message.description}</p>
      </div>
    </div>
  )
}
