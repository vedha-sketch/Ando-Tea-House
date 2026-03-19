import { useEffect } from 'react'
import './ConfirmationZen.css'

export default function ConfirmationZen({ onReset }) {
  useEffect(() => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }
  }, [])

  return (
    <div className="zen-confirmation">
      <div className="confirmation-bg-gradient" />
      <div className="confirmation-bg-texture" />

      <div className="confirmation-card">
        {/* Success icon */}
        <div className="success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Main message */}
        <p className="confirmation-eyebrow">Order Complete</p>
        <h1 className="confirmation-title">Enjoy Your Matcha</h1>
        <p className="confirmation-message">
          Crafted with care, ready for you
        </p>

        {/* Matcha bowl illustration */}
        <div className="confirmation-illustration">
          <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20 Q12 48, 40 52 Q68 48, 68 20" stroke="#556B2F" strokeWidth="1" fill="none" opacity="0.4" />
            <ellipse cx="40" cy="20" rx="28" ry="7" stroke="#556B2F" strokeWidth="1" fill="rgba(85, 107, 47, 0.04)" opacity="0.4" />
          </svg>
        </div>

        {/* Location hint */}
        <div className="location-hint">
          <svg className="hint-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#556B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <p className="hint-label">Ready at the window</p>
        </div>

        {/* CTA */}
        <button onClick={onReset} className="order-again-btn">
          Place Another Order
        </button>
      </div>

      {/* Footer */}
      <div className="confirmation-footer">
        Questions? Visit andocafes.com
      </div>
    </div>
  )
}
