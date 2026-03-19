import { useState } from 'react'
import './Checkout.css'

export default function Checkout({ sessionId, drink, onPaymentSuccess, onCancel }) {
  const [cardNumber, setCardNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)

    try {
      // Call backend to create payment intent
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
    <div className="page-content">
      <div className="page-inner">
        <div className="checkout-container">
          <h1>Complete Payment</h1>

          {error && <div className="error-message">{error}</div>}

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>{drink.drinkName} ({drink.size})</span>
              <span>${drink.price.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>${drink.price.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                disabled={processing}
              />
              <small>Use 4242 4242 4242 4242 for testing</small>
            </div>

            <button type="submit" disabled={processing}>
              {processing ? 'Processing...' : 'Pay Now'}
            </button>
          </form>

          <button onClick={onCancel} className="cancel-button" disabled={processing}>
            Cancel
          </button>

          <p className="security-note">
            💳 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
