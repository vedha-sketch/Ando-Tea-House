import { useState, useEffect } from 'react'
import './App.css'
import MenuZen from './pages/MenuZen'
import CheckoutZen from './pages/CheckoutZen'
import ScanQRZen from './pages/ScanQRZen'
import OrderStatusZen from './pages/OrderStatusZen'
import ConfirmationZen from './pages/ConfirmationZen'

export default function App() {
  const [currentPage, setCurrentPage] = useState('menu') // menu, checkout, scan, status, confirmation
  const [orderId, setOrderId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [selectedDrink, setSelectedDrink] = useState(null)

  useEffect(() => {
    const sid = 'session-' + Date.now()
    setSessionId(sid)
  }, [])

  const handleDrinkSelect = (drink) => {
    // drink comes from MenuZen with: drinkId, drinkName, size, price, videoUrl
    setSelectedDrink(drink)
    setCurrentPage('checkout')
  }

  const handlePaymentSuccess = (oid) => {
    setOrderId(oid)
    setCurrentPage('scan')
  }

  const handleScanComplete = () => {
    setCurrentPage('status')
  }

  const handleOrderComplete = () => {
    setCurrentPage('confirmation')
  }

  const handleReset = () => {
    setCurrentPage('menu')
    setOrderId(null)
    setSelectedDrink(null)
  }

  return (
    <div className="page-wrapper">
      {currentPage === 'menu' && (
        <MenuZen
          sessionId={sessionId}
          onDrinkSelect={handleDrinkSelect}
        />
      )}
      {currentPage === 'checkout' && (
        <CheckoutZen
          sessionId={sessionId}
          drink={selectedDrink}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setCurrentPage('menu')}
        />
      )}
      {currentPage === 'scan' && (
        <ScanQRZen
          drink={selectedDrink}
          orderId={orderId}
          onScanComplete={handleScanComplete}
          onCancel={handleReset}
        />
      )}
      {currentPage === 'status' && (
        <OrderStatusZen
          orderId={orderId}
          orderData={selectedDrink}
          onOrderComplete={handleOrderComplete}
        />
      )}
      {currentPage === 'confirmation' && (
        <ConfirmationZen
          drinkName={selectedDrink?.drinkName}
          drinkIcon={selectedDrink?.icon}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
