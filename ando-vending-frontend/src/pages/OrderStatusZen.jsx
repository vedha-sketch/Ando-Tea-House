import { useState, useEffect, useRef } from 'react'
import { colors, spacing, borderRadius, shadows, stageMapping } from '../styles/design-system'
import './OrderStatusZen.css'

// Matcha-cohesive color palette pulled from the video
const matcha = {
  vibrant: '#738065',    // vibrant matcha green (progress stroke)
  soft: '#8a9a7b',       // soft matcha (secondary)
  cream: '#f3f0e8',      // ceramic bowl cream
  deep: '#5c6b50',       // deep matcha (dark accent)
}

// Haptic feedback wrapper
function triggerHaptic(pattern = 'pulse') {
  if (!navigator.vibrate) return

  if (pattern === 'pulse') {
    navigator.vibrate([50, 30, 50])
  } else if (pattern === 'success') {
    navigator.vibrate([200, 100, 200])
  } else if (pattern === 'ready') {
    navigator.vibrate([100, 50, 100, 50, 100])
  }
}

function PreparationView({ drink, orderId, videoUrl, videoRef, progress, onVideoComplete, onVideoTimeUpdate }) {
  const circumference = 2 * Math.PI * 45 // ~283
  const strokeDash = (progress / 100) * circumference
  const liquidHeight = `${Math.min(progress, 100)}%`

  return (
    <div className="zen-view preparation-view">
      {/* Framed video container - can shrink */}
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
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-icon">🍵</div>
            <p>Preparing your drink</p>
          </div>
        )}
      </div>

      {/* Glassmorphism content panel - never shrinks */}
      <div className="preparation-content">
        <p className="status-message">
          Ando is Crafting
        </p>
        <h2 className="drink-name">{drink.drinkName}</h2>
        <p className="drink-detail">{drink.size}</p>

        {/* Progress ring with liquid wave fill */}
        <div className="progress-container">
          {/* Liquid wave fill behind the ring */}
          <div className="progress-liquid">
            <div className="liquid-fill" style={{ height: liquidHeight }}>
              <svg className="liquid-wave" viewBox="0 0 200 16" preserveAspectRatio="none">
                <path
                  d="M0,8 C25,2 50,14 75,8 C100,2 125,14 150,8 C175,2 200,14 200,8 L200,16 L0,16 Z"
                  fill={matcha.vibrant}
                  fillOpacity="0.15"
                />
              </svg>
            </div>
          </div>

          {/* SVG ring */}
          <svg className="progress-ring" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={matcha.cream}
              strokeWidth="2"
            />
            {/* Progress circle - matcha green */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={matcha.vibrant}
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
      {/* Glassmorphism card */}
      <div className="fulfillment-card">
        {/* Ready badge */}
        <div className="ready-badge">
          <span className="ready-dot pulse" />
          Ready
        </div>

        {/* Main message */}
        <h1 className="fulfillment-title">Your Drink Awaits</h1>
        <p className="fulfillment-subtitle">
          {drink.drinkName} · {drink.size}
        </p>

        {/* Visual cue - thin chevron with pulse */}
        <div className={`visual-cue ${showAnimation ? 'animate' : ''}`}>
          <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="#556B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <p className="cue-text">Look for the window</p>
        </div>

        {/* Pill-shaped confirm button */}
        <button
          onClick={onPickup}
          className="pickup-button-pill"
        >
          Confirm Pickup
        </button>
      </div>

      {/* Order ID footer - decluttered from main view */}
      <div className="order-footer">
        Order {orderId}
      </div>
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
      if (duration > 0) {
        const videoProgress = (currentTime / duration) * 100
        setProgress(videoProgress)
      }
    }
  }

  const handleVideoComplete = () => {
    setProgress(100)
    setCurrentView('FULFILLMENT')
    triggerHaptic('ready')
  }

  const drink = orderData || { drinkName: 'Matcha Latte', size: 'Small' }

  return (
    <div
      className="zen-order-status"
      style={{
        backgroundColor: matcha.cream,
        height: '100dvh',
        padding: `${spacing.sm} ${spacing.md} max(${spacing.sm}, env(safe-area-inset-bottom))`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", sans-serif',
        overflow: 'hidden',
      }}
    >
      {currentView === 'PREPARATION' ? (
        <PreparationView
          drink={drink}
          orderId={orderId}
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
  )
}
