import { useState, useEffect, useRef } from 'react'
import { spacing, borderRadius } from '../styles/design-system'
import './OrderStatusZen.css'

// Unified Ando palette
const ando = {
  cream: '#F2F0E9',
  forest: '#2d3b1e',
  olive: '#556B2F',
  muted: '#9c9a8e',
  matcha: '#738065',
  ringBg: '#eae7df',
}

// Haptic feedback wrapper
function triggerHaptic(pattern = 'pulse') {
  if (!navigator.vibrate) return
  if (pattern === 'pulse') navigator.vibrate([50, 30, 50])
  else if (pattern === 'success') navigator.vibrate([200, 100, 200])
  else if (pattern === 'ready') navigator.vibrate([100, 50, 100, 50, 100])
}

function PreparationView({ drink, videoUrl, videoRef, progress, onVideoComplete, onVideoTimeUpdate }) {
  const circumference = 2 * Math.PI * 45
  const strokeDash = (progress / 100) * circumference
  const liquidHeight = `${Math.min(progress, 100)}%`

  return (
    <div className="zen-view preparation-view">
      <div className="video-frame">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            muted
            playsInline
            className="preparation-video"
            onEnded={onVideoComplete}
            onTimeUpdate={onVideoTimeUpdate}
          />
        ) : (
          <div className="video-placeholder">
            <p>Preparing your drink</p>
          </div>
        )}
      </div>

      <div className="preparation-content">
        <p className="status-message">Ando is Crafting</p>
        <h2 className="drink-name">{drink.drinkName}</h2>
        <p className="drink-detail">{drink.size}</p>

        <div className="progress-container">
          <div className="progress-liquid">
            <div className="liquid-fill" style={{ height: liquidHeight }}>
              <svg className="liquid-wave" viewBox="0 0 200 16" preserveAspectRatio="none">
                <path
                  d="M0,8 C25,2 50,14 75,8 C100,2 125,14 150,8 C175,2 200,14 200,8 L200,16 L0,16 Z"
                  fill={ando.matcha}
                  fillOpacity="0.15"
                />
              </svg>
            </div>
          </div>
          <svg className="progress-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke={ando.ringBg} strokeWidth="2" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={ando.matcha}
              strokeWidth="2.5"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  )
}

function FulfillmentView({ drink, orderId, onPickup }) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    setShowAnimation(true)
    triggerHaptic('ready')
  }, [])

  return (
    <div className="zen-view fulfillment-view">
      <div className="fulfillment-card">
        <div className="ready-badge">
          <span className="ready-dot pulse" />
          Ready
        </div>

        <h1 className="fulfillment-title">Your Drink Awaits</h1>
        <p className="fulfillment-subtitle">
          {drink.drinkName} · {drink.size}
        </p>

        <div className={`visual-cue ${showAnimation ? 'animate' : ''}`}>
          <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke={ando.olive} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <p className="cue-text">Look for the window</p>
        </div>

        <button onClick={onPickup} className="pickup-button-pill">
          Confirm Pickup
        </button>
      </div>

      <div className="order-footer">Order {orderId}</div>
    </div>
  )
}

export default function OrderStatusZen({ orderId, orderData, onOrderComplete }) {
  const [progress, setProgress] = useState(0)
  const [currentView, setCurrentView] = useState('PREPARATION')
  const videoRef = useRef(null)

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current
      if (duration > 0) setProgress((currentTime / duration) * 100)
    }
  }

  const handleVideoComplete = () => {
    setProgress(100)
    setCurrentView('FULFILLMENT')
    triggerHaptic('ready')
  }

  const drink = orderData || { drinkName: 'Matcha Latte', size: 'Small' }

  return (
    <div className="zen-order-status">
      <div className="status-bg-gradient" />
      <div className="status-bg-texture" />

      <div className="status-inner">
        {currentView === 'PREPARATION' ? (
          <PreparationView
            drink={drink}
            videoUrl="/videos/matcha.mp4"
            videoRef={videoRef}
            progress={progress}
            onVideoComplete={handleVideoComplete}
            onVideoTimeUpdate={handleVideoTimeUpdate}
          />
        ) : (
          <FulfillmentView
            drink={drink}
            orderId={orderId}
            onPickup={() => {
              triggerHaptic('success')
              onOrderComplete()
            }}
          />
        )}
      </div>
    </div>
  )
}
