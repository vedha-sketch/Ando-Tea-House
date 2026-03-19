import { useState, useEffect } from 'react'
import { colors, spacing, borderRadius } from '../styles/design-system'
import './MenuZen.css'

const DRINKS = [
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    description: 'Ceremonial-grade matcha, stone-ground and whisked with steamed milk',
    basePrice: 6.50,
    sizes: [
      { size: 'Small', price: 0 },
      { size: 'Medium', price: 0.75 },
      { size: 'Large', price: 1.50 },
    ],
  },
]

// Minimalist thin-line matcha bowl icon
function MatchaIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steam wisps */}
      <path d="M30 18 C30 12, 34 10, 34 4" stroke="#556B2F" strokeWidth="1" strokeLinecap="round" opacity="0.4">
        <animate attributeName="d" values="M30 18 C30 12, 34 10, 34 4;M30 18 C28 12, 32 8, 34 2;M30 18 C30 12, 34 10, 34 4" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M40 16 C40 10, 44 8, 44 2" stroke="#556B2F" strokeWidth="1" strokeLinecap="round" opacity="0.3">
        <animate attributeName="d" values="M40 16 C40 10, 44 8, 44 2;M40 16 C38 10, 42 6, 44 0;M40 16 C40 10, 44 8, 44 2" dur="3.5s" repeatCount="indefinite" />
      </path>
      <path d="M50 18 C50 12, 46 10, 46 4" stroke="#556B2F" strokeWidth="1" strokeLinecap="round" opacity="0.35">
        <animate attributeName="d" values="M50 18 C50 12, 46 10, 46 4;M50 18 C52 12, 48 8, 46 2;M50 18 C50 12, 46 10, 46 4" dur="2.8s" repeatCount="indefinite" />
      </path>
      {/* Bowl */}
      <path d="M16 32 Q16 60, 40 64 Q64 60, 64 32" stroke="#556B2F" strokeWidth="1.2" fill="none" />
      {/* Matcha surface */}
      <ellipse cx="40" cy="32" rx="24" ry="6" stroke="#556B2F" strokeWidth="1.2" fill="rgba(85, 107, 47, 0.06)" />
      {/* Chasen whisk marks */}
      <path d="M32 30 Q40 36, 48 30" stroke="#556B2F" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M34 32 Q40 37, 46 32" stroke="#556B2F" strokeWidth="0.6" fill="none" opacity="0.2" />
    </svg>
  )
}

export default function MenuZen({ sessionId, onDrinkSelect }) {
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [selectedSize, setSelectedSize] = useState('Small')
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
    setSelectedSize('Small')
  }

  const handleContinue = () => {
    if (!selectedDrink || !selectedSize) {
      setError('Please select a drink and size')
      return
    }

    const sizeData = selectedDrink.sizes.find(s => s.size === selectedSize)
    const totalPrice = selectedDrink.basePrice + sizeData.price

    onDrinkSelect({
      drinkId: selectedDrink.id,
      drinkName: selectedDrink.name,
      size: selectedSize,
      price: totalPrice,
    })
  }

  return (
    <div className="zen-menu">
      {/* Atmospheric background layers */}
      <div className="menu-bg-gradient" />
      <div className="menu-bg-texture" />

      {isBusy && <div className="busy-warning-zen">Machine is preparing an order. Please wait.</div>}

      {!selectedDrink ? (
        <div className="menu-container">
          <div className="menu-header">
            <p className="menu-eyebrow">Ando Chashitsu</p>
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
                <MatchaIcon className="drink-icon" />
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
          <button
            onClick={() => setSelectedDrink(null)}
            className="back-btn-zen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div className="size-header">
            <MatchaIcon className="drink-icon-large" />
            <h1 className="size-title">{selectedDrink.name}</h1>
            <p className="size-subtitle">{selectedDrink.description}</p>
          </div>

          {error && <div className="error-message-zen">{error}</div>}

          <div className="size-grid-zen">
            <p className="size-label">Select Size</p>
            {selectedDrink.sizes.map(sizeOption => {
              const price = selectedDrink.basePrice + sizeOption.price
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

          <button
            onClick={handleContinue}
            disabled={isBusy}
            className="continue-btn-zen"
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  )
}
