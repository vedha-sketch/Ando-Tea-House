import { useState } from 'react'
import { spacing } from '../styles/design-system'
import './CheckoutZen.css'

export default function CheckoutZen({ sessionId, drink, onPaymentSuccess, onCancel }) {
  const [cardNumber, setCardNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)

    const cleanCard = cardNumber.replace(/\s/g, '')
    if (cleanCard.length !== 16 || !/^\d+$/.test(cleanCard)) {
      setError('Please enter a valid 16-digit card number.')
      setProcessing(false)
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          drinkId: drink.drinkId,
          size: drink.size,
          amount: Math.round(drink.price * 100),
        }),
      })

      if (!res.ok) {
        throw new Error('Payment failed')
      }

      const data = await res.json()
      onPaymentSuccess(data.orderId, data)
    } catch (err) {
      setError('Payment processing failed. Please try again.')
      setProcessing(false)
      console.error(err)
    }
  }

  return (
    <div className="zen-checkout">
      <div className="checkout-bg-gradient" />
      <div className="checkout-bg-texture" />

      <div className="checkout-card">
        {/* Header */}
        <div className="checkout-header">
          <p className="checkout-eyebrow">Secure Checkout</p>
          <h1 className="checkout-title">Complete Payment</h1>
        </div>

        {/* Order Summary */}
        <div className="order-summary-zen">
          <div className="summary-item">
            <span className="summary-label">{drink.drinkName}</span>
            <span className="summary-value">${drink.price.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Size</span>
            <span className="summary-value">{drink.size}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item total">
            <span className="summary-label">Total</span>
            <span className="summary-value-total">${drink.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="error-message-zen">{error}</div>}

        {/* Payment form */}
        <form onSubmit={handlePayment} className="payment-form-zen">
          <div className="form-group-zen">
            <label className="form-label">Card Number</label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
              disabled={processing}
              className="card-input"
              maxLength="19"
            />
            <small className="helper-text">Use 4242 4242 4242 4242 for testing</small>
          </div>

          <button
            type="submit"
            disabled={processing || !cardNumber.trim()}
            className="pay-button-pill"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </form>

        {/* Cancel */}
        <button
          onClick={onCancel}
          disabled={processing}
          className="cancel-button-zen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Go Back
        </button>

        {/* Security footer */}
        <div className="security-note-zen">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p>Secure and encrypted</p>
        </div>
      </div>
    </div>
  )
}
