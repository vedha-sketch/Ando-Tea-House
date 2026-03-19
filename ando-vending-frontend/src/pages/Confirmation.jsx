import './Confirmation.css'

export default function Confirmation({ onReset }) {
  return (
    <div className="page-content">
      <div className="page-inner">
        <div className="confirmation-container">
          <div className="success-icon">✓</div>
          <h1>Order Complete!</h1>
          <p className="success-message">
            Your drink is ready at the dispensing window.
          </p>

          <div className="celebration">
            <span className="emoji">🎉</span>
            <span className="emoji">🍵</span>
            <span className="emoji">🎉</span>
          </div>

          <div className="next-steps">
            <h3>Next Steps</h3>
            <ol>
              <li>Grab your delicious drink from the window</li>
              <li>Enjoy! ☕</li>
              <li>Come back for more</li>
            </ol>
          </div>

          <button onClick={onReset} className="primary-button">
            Place Another Order
          </button>

          <p className="feedback-note">
            Questions? Visit us at andocafes.com or scan the QR code again
          </p>
        </div>
      </div>
    </div>
  )
}
