import { useEffect } from 'react'
import { colors, spacing, borderRadius } from '../styles/design-system'
import './ConfirmationZen.css'

export default function ConfirmationZen({ onReset }) {
  useEffect(() => {
    // Haptic feedback on completion
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }
  }, [])

  return (
    <div
      className="zen-confirmation"
      style={{
        backgroundColor: colors.cream,
        minHeight: '100vh',
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div className="confirmation-card">
        {/* Success animation */}
        <div className="success-animation">
          <div className="checkmark">✓</div>
        </div>

        {/* Main message */}
        <h1 className="confirmation-title">Order Complete!</h1>
        <p className="confirmation-message">
          Your delicious Matcha Latte is ready
        </p>

        {/* Celebration */}
        <div className="celebration-zen">
          <span className="emoji">🎉</span>
          <span className="emoji">🍵</span>
          <span className="emoji">🎉</span>
        </div>

        {/* Location hint */}
        <div className="location-hint">
          <p className="hint-label">Ready at the window</p>
          <p className="hint-emoji">👇</p>
        </div>

        {/* CTA */}
        <button
          onClick={onReset}
          className="order-again-btn"
          style={{
            backgroundColor: colors.matcha,
            color: colors.white,
          }}
        >
          Place Another Order
        </button>

        {/* Footer note */}
        <p className="footer-note">
          <span className="contact-icon">💬</span>
          Questions? Visit andocafes.com
        </p>
      </div>
    </div>
  )
}
