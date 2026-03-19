import { useState, useEffect } from 'react'
import './App.css'
import MenuZen from './pages/MenuZen'
import CheckoutZen from './pages/CheckoutZen'
import OrderStatusZen from './pages/OrderStatusZen'
import ConfirmationZen from './pages/ConfirmationZen'

export default function App() {
  const [currentPage, setCurrentPage] = useState('menu') // menu, checkout, status, confirmation
  const [orderId, setOrderId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    // Generate a simple session ID on app load
    const sid = 'session-' + Date.now()
    setSessionId(sid)
  }, [])

  const handleDrinkSelect = (drink) => {
    setSelectedDrink(drink)
    setCurrentPage('checkout')
  }

  const handlePaymentSuccess = (oid, data) => {
    setOrderId(oid)
    setOrderData(data)
    setCurrentPage('status')
  }

  const handleOrderComplete = () => {
    setCurrentPage('confirmation')
  }

  const handleReset = () => {
    setCurrentPage('menu')
    setOrderId(null)
    setSelectedDrink(null)
    setOrderData(null)
  }

  return (
    <div className="page-wrapper">
      {currentPage === 'menu' && <MenuZen sessionId={sessionId} onDrinkSelect={handleDrinkSelect} />}
      {currentPage === 'checkout' && (
        <CheckoutZen
          sessionId={sessionId}
          drink={selectedDrink}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setCurrentPage('menu')}
        />
      )}
      {currentPage === 'status' && (
        <OrderStatusZen
          orderId={orderId}
          orderData={orderData}
          onOrderComplete={handleOrderComplete}
        />
      )}
      {currentPage === 'confirmation' && <ConfirmationZen onReset={handleReset} />}
    </div>
  )
}
