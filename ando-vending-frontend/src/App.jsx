import { useState, useEffect } from 'react'
import './App.css'
import ScanQR from './pages/ScanQR'
import Menu from './pages/Menu'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import Confirmation from './pages/Confirmation'

export default function App() {
  const [currentPage, setCurrentPage] = useState('scan') // scan, menu, checkout, status, confirmation
  const [orderId, setOrderId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [orderData, setOrderData] = useState(null)

  const handleSessionStart = (sid) => {
    setSessionId(sid)
    setCurrentPage('menu')
  }

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
    setCurrentPage('scan')
    setOrderId(null)
    setSessionId(null)
    setSelectedDrink(null)
    setOrderData(null)
  }

  return (
    <div className="page-wrapper">
      {currentPage === 'scan' && <ScanQR onSessionStart={handleSessionStart} />}
      {currentPage === 'menu' && <Menu sessionId={sessionId} onDrinkSelect={handleDrinkSelect} />}
      {currentPage === 'checkout' && (
        <Checkout
          sessionId={sessionId}
          drink={selectedDrink}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setCurrentPage('menu')}
        />
      )}
      {currentPage === 'status' && (
        <OrderStatus
          orderId={orderId}
          orderData={orderData}
          onOrderComplete={handleOrderComplete}
        />
      )}
      {currentPage === 'confirmation' && <Confirmation onReset={handleReset} />}
    </div>
  )
}
