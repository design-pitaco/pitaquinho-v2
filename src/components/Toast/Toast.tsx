import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircleIcon, XIcon } from '@phosphor-icons/react'
import './Toast.css'

interface ToastProps {
  isVisible: boolean
  onClose: () => void
  title: string
  message: string
  duration?: number
}

export function Toast({
  isVisible,
  onClose,
  title,
  message,
  duration = 4000,
}: ToastProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const handleClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
    }
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false)
      setIsClosing(false)
      closeTimerRef.current = null
      onClose()
    }, 300)
  }, [onClose])

  // Handle open/close with animation
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isVisible) {
        if (closeTimerRef.current !== null) {
          window.clearTimeout(closeTimerRef.current)
          closeTimerRef.current = null
        }
        setShouldRender(true)
        setIsClosing(false)
      } else if (shouldRender && !isClosing) {
        setIsClosing(true)
        closeTimerRef.current = window.setTimeout(() => {
          setShouldRender(false)
          setIsClosing(false)
          closeTimerRef.current = null
        }, 300)
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isVisible, shouldRender, isClosing])

  // Auto dismiss
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, handleClose])

  if (!shouldRender) return null

  return (
    <div className={`toast ${isClosing ? 'toast--closing' : ''}`}>
      <div className="toast__header">
        <div className="toast__title">
          <CheckCircleIcon aria-hidden="true" className="toast__icon-ok" weight="fill" />
          <span>{title}</span>
        </div>
        <button type="button" className="toast__close" onClick={handleClose} aria-label="Fechar">
          <XIcon aria-hidden="true" className="toast__icon-close" weight="bold" />
        </button>
      </div>
      <div className="toast__content">
        <p>{message}</p>
      </div>
    </div>
  )
}
