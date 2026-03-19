import { useState, useEffect } from 'react'
import RobotStateDisplay from '../components/RobotStateDisplay'
import './OrderStatus.css'

export default function OrderStatus({ orderId, orderData, onOrderComplete }) {
  const [robotState, setRobotState] = useState('Preparation')
  const [eta, setEta] = useState(45)
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    // Connect to WebSocket for real-time state updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${import.meta.env.VITE_API_HOST || 'localhost:8000'}/ws/${orderId}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setRobotState(data.state)
        setEta(data.eta || eta)

        if (data.state === 'Conclusion') {
          setTimeout(() => {
            onOrderComplete()
          }, 2000)
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      setWsConnected(false)
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [orderId, onOrderComplete])

  return (
    <div className="page-content order-status-page">
      <div className="page-inner">
        <div className="status-container">
          <h1>Your Order is Being Prepared</h1>

          <RobotStateDisplay state={robotState} />

          <div className="status-info">
            <div className="status-row">
              <span className="label">Order ID:</span>
              <span className="value">{orderId}</span>
            </div>
            <div className="status-row">
              <span className="label">Drink:</span>
              <span className="value">
                {orderData.drinkName} ({orderData.size})
              </span>
            </div>
            <div className="status-row">
              <span className="label">Status:</span>
              <span className="value state-badge">{robotState}</span>
            </div>
          </div>

          {eta > 0 && (
            <div className="eta-display">
              <p className="eta-label">Estimated Wait Time</p>
              <p className="eta-time">{eta}s</p>
            </div>
          )}

          {!wsConnected && (
            <div className="connection-warning">
              Connecting to machine...
            </div>
          )}

          <div className="instructions">
            <p>🚀 Your robot friend is preparing your drink!</p>
            <p>Watch as it moves through the preparation stages and brings your order to the window.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
