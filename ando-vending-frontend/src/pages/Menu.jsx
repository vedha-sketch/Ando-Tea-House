import { useState, useEffect } from 'react'
import './Menu.css'

const DRINKS = [
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    description: 'Traditional whisked matcha with creamy milk',
    basePrice: 6.50,
    sizes: [
      { size: 'Small', price: 0 },
      { size: 'Medium', price: 0.75 },
      { size: 'Large', price: 1.50 },
    ],
  },
]

export default function Menu({ sessionId, onDrinkSelect }) {
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [selectedSize, setSelectedSize] = useState('Small')
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if machine is busy
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
    <div className="page-content">
      <div className="page-inner">
        {isBusy && (
          <div className="busy-warning">
            The machine is currently preparing an order. Please wait a moment and try again.
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!selectedDrink ? (
          <div className="drink-selection">
            <h1>Select Your Drink</h1>
            <p>Choose from our available menu</p>

            <div className="drinks-grid">
              {DRINKS.map(drink => (
                <div
                  key={drink.id}
                  className="drink-card"
                  onClick={() => handleSelectDrink(drink)}
                >
                  <div className="drink-icon">🍵</div>
                  <h3>{drink.name}</h3>
                  <p className="drink-description">{drink.description}</p>
                  <p className="drink-price">From ${drink.basePrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="size-selection">
            <button
              onClick={() => setSelectedDrink(null)}
              className="back-button"
            >
              ← Back
            </button>

            <h1>{selectedDrink.name}</h1>
            <p>{selectedDrink.description}</p>

            <div className="size-options">
              <p className="size-label">Select Size</p>
              {selectedDrink.sizes.map(sizeOption => {
                const price = selectedDrink.basePrice + sizeOption.price
                return (
                  <button
                    key={sizeOption.size}
                    className={`size-button ${selectedSize === sizeOption.size ? 'active' : ''}`}
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
              className="continue-button"
              disabled={isBusy}
            >
              Continue to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
