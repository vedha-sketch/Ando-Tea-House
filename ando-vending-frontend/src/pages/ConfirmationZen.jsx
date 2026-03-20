import { useEffect } from 'react'
import DrinkIcon from '../components/DrinkIcons'
import './ConfirmationZen.css'

export default function ConfirmationZen({ drinkName, drinkIcon, onReset }) {
  useEffect(() => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }
  }, [])

  const displayName = drinkName || 'Your Drink'

  return (
    <div className="zen-confirmation">
      <div className="master-card">
        {/* TOP: Brand block */}
        <div className="card-top">
          <div className="brand-block">
            <img src="/ando-logo.png" alt="Ando Tea House" className="brand-logo" />
            <span className="brand-name">Ando Tea House</span>
          </div>
          <div className="brand-divider" />
        </div>

        {/* CENTER: Content */}
        <div className="card-center">
          <p className="confirmation-eyebrow">Order Complete</p>

          <h1 className="confirmation-title">Enjoy Your {displayName}</h1>
          <p className="confirmation-message">
            Crafted with care, ready for you
          </p>

          {/* Drink illustration — hero visual */}
          <div className="confirmation-illustration">
            <DrinkIcon iconKey={drinkIcon} className="confirmation-drink-icon" />
          </div>

        </div>

        {/* BOTTOM: Ghost button */}
        <div className="card-bottom">
          <button onClick={onReset} className="order-again-btn">
            Place Another Order
          </button>
        </div>
      </div>

      {/* Footer — outside card */}
      <div className="confirmation-footer">
        Questions? Visit andocafes.com
      </div>
    </div>
  )
}
