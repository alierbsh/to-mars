/** A short message at the bottom of the screen ("Link copied"), gone after a few seconds. */
import { useEffect, useState } from 'react'
import { useAppStore } from '../state/store'

export default function Toast() {
  const toast = useAppStore((s) => s.toast)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const id = window.setTimeout(() => setVisible(false), 2600)
    return () => window.clearTimeout(id)
  }, [toast])
  if (!toast) return null
  return (
    <div className={`toast ${visible ? 'toast--on' : ''}`} role="status" aria-live="polite">
      {toast.text}
    </div>
  )
}
