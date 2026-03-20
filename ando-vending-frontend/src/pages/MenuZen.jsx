import { useState, useEffect } from 'react'
import { DRINKS, getDrinkPrice } from '../config/drinks'
import DrinkIcon from '../components/DrinkIcons'
import './MenuZen.css'

export default function MenuZen({ sessionId, onDrinkSelect }) {
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkMachineStatus()
  }, [])

  const checkMachineStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/machine/status`)
      const data = await res.json()
      setIsBusy(!data.isAvailable)
    } catch (err) {
      console.error('Failed to check machine status:', err)
    }
  }

  const handleSelectDrink = (drink) => {
    setSelectedDrink(drink)
    setSelectedSize(drink.sizes[0].size)
  }

  const handleContinue = () => {
    if (!selectedDrink || !selectedSize) {
      setError('Please select a drink and size')
      return
    }

    const totalPrice = getDrinkPrice(selectedDrink, selectedSize)

    onDrinkSelect({
      drinkId: selectedDrink.id,
      drinkName: selectedDrink.name,
      size: selectedSize,
      price: totalPrice,
      videoUrl: selectedDrink.videoUrl,
      icon: selectedDrink.icon,
    })
  }

  return (
    <div className="zen-menu">
      {isBusy && <div className="busy-warning-zen">Machine is preparing an order. Please wait.</div>}

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
          {!selectedDrink ? (
            <div className="menu-container">
              <div className="menu-header">
                <h1 className="menu-title">Our Menu</h1>
                <p className="menu-subtitle">Crafted with intention</p>
              </div>

              {error && <div className="error-message-zen">{error}</div>}

              <div className="drinks-grid-zen">
                {DRINKS.map(drink => (
                  <div
                    key={drink.id}
                    className="drink-card-zen"
                    onClick={() => handleSelectDrink(drink)}
                  >
                    <DrinkIcon iconKey={drink.icon} className="drink-icon" />
                    <div className="drink-card-text">
                      <h3 className="drink-title">{drink.name}</h3>
                      <p className="drink-desc">{drink.description}</p>
                    </div>
                    <div className="drink-card-action">
                      <span className="drink-starting-price">From ${drink.basePrice.toFixed(2)}</span>
                      <span className="drink-select-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="size-container">
              <div className="size-header">
                <h1 className="size-title">{selectedDrink.name}</h1>
                <p className="size-subtitle">{selectedDrink.description}</p>
              </div>

              {error && <div className="error-message-zen">{error}</div>}

              <div className="size-grid-zen">
                <p className="size-label">Select Size</p>
                {selectedDrink.sizes.map(sizeOption => {
                  const price = getDrinkPrice(selectedDrink, sizeOption.size)
                  return (
                    <button
                      key={sizeOption.size}
                      className={`size-card-zen ${selectedSize === sizeOption.size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sizeOption.size)}
                    >
                      <span className="size-name">{sizeOption.size}</span>
                      <span className="size-price">${price.toFixed(2)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM: Action buttons */}
        <div className="card-bottom">
          {selectedDrink ? (
            <>
              <button
                onClick={handleContinue}
                disabled={isBusy}
                className="continue-btn-zen"
              >
                Continue to Payment
              </button>
              <button
                onClick={() => setSelectedDrink(null)}
                className="goback-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Go Back
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
