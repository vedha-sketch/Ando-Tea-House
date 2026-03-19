import { useState, useEffect } from 'react'
import { colors, spacing, borderRadius } from '../styles/design-system'
import './MenuZen.css'

const DRINKS = [
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    description: 'Traditional whisked matcha with creamy milk',
    emoji: '🍵',
    basePrice: 6.50,
    sizes: [
      { size: 'Small', price: 0 },
      { size: 'Medium', price: 0.75 },
      { size: 'Large', price: 1.50 },
    ],
  },
]

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
    <div
      className="zen-menu"
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
      {isBusy && <div className="busy-warning-zen">Machine is preparing an order. Please wait.</div>}

      {!selectedDrink ? (
        <div className="menu-container">
          <div className="menu-header">
            <h1>Our Menu</h1>
            <p>Select your drink</p>
          </div>

          {error && <div className="error-message-zen">{error}</div>}

          <div className="drinks-grid-zen">
            {DRINKS.map(drink => (
              <div
                key={drink.id}
                className="drink-card-zen"
                onClick={() => handleSelectDrink(drink)}
              >
                <div className="drink-emoji">{drink.emoji}</div>
                <h3 className="drink-title">{drink.name}</h3>
                <p className="drink-desc">{drink.description}</p>
                <p className="drink-starting-price">From ${drink.basePrice.toFixed(2)}</p>
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
            ← Back
          </button>

          <div className="size-header">
            <div className="drink-emoji-large">{selectedDrink.emoji}</div>
            <h1>{selectedDrink.name}</h1>
            <p className="size-subtitle">{selectedDrink.description}</p>
          </div>

          {error && <div className="error-message-zen">{error}</div>}

          <div className="size-grid-zen">
            <p className="size-label">SELECT SIZE</p>
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
            style={{
              backgroundColor: isBusy ? colors.stone300 : colors.matcha,
              color: colors.white,
            }}
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  )
}
