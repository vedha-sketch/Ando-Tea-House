import { useState, useEffect } from 'react'
import { colors, spacing, borderRadius, shadows, stageMapping } from '../styles/design-system'
import './OrderStatusZen.css'

// Stage controller: maps hardware stages to user views
function getViewFromStage(stage) {
  if (stageMapping.PREPARATION.stages.includes(stage)) {
    return 'PREPARATION'
  }
  if (stageMapping.FULFILLMENT.stages.includes(stage)) {
    return 'FULFILLMENT'
  }
  return 'PREPARATION'
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

function PreparationView({ drink, orderId, videoUrl, progress, onVideoComplete }) {
  return (
    <div className="zen-view preparation-view">
      {/* Framed video container */}
      <div className="video-frame">
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            muted
            playsInline
            className="preparation-video"
            onEnded={onVideoComplete}
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

      {/* Content below video */}
      <div className="preparation-content">
        <p className="status-message" style={{ color: colors.amber }}>
          Ando is Crafting
        </p>
        <h2 className="drink-name">{drink.drinkName}</h2>
        <p className="drink-detail">{drink.size}</p>

        {/* Progress ring */}
        <div className="progress-container">
          <svg className="progress-ring" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={colors.stone200}
              strokeWidth="2"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={colors.amber}
              strokeWidth="2"
              strokeDasharray={`${progress * 2.83} 283`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>

        {/* Breathing pulse animation for background */}
        <div className="breathing-pulse" />
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
      <div className="fulfillment-content">
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

        {/* Visual cue - animated arrow */}
        <div className={`visual-cue ${showAnimation ? 'animate' : ''}`}>
          <div className="arrow-pointing">↓</div>
          <p className="cue-text">Look for the window</p>
        </div>

        {/* Order ID for reference */}
        <div className="order-reference">
          <span className="ref-label">Order</span>
          <span className="ref-id">{orderId}</span>
        </div>

        {/* Pickup button */}
        <button
          onClick={onPickup}
          className="pickup-button"
          style={{
            backgroundColor: colors.matcha,
            color: colors.white,
            padding: `${spacing.lg} ${spacing.xl}`,
            borderRadius: borderRadius.lg,
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: spacing.xl,
          }}
        >
          Confirm Pickup
        </button>
      </div>
    </div>
  )
}

export default function OrderStatusZen({ orderId, orderData, onOrderComplete }) {
  const [currentStage, setCurrentStage] = useState(4)
  const [progress, setProgress] = useState(0)
  const [currentView, setCurrentView] = useState('PREPARATION')
  const [videoCompleted, setVideoCompleted] = useState(false)

  const handleVideoComplete = () => {
    setVideoCompleted(true)
    // Move to fulfillment stage after video completes
    setCurrentStage(5)
    setCurrentView('FULFILLMENT')
  }

  // Update progress based on stage (only while video is playing)
  useEffect(() => {
    if (!videoCompleted) {
      const stageProgress = (currentStage / 6) * 100
      setProgress(stageProgress)
    } else {
      setProgress(100)
    }
  }, [currentStage, videoCompleted])

  const drink = orderData || { drinkName: 'Matcha Latte', size: 'Small' }

  return (
    <div
      className="zen-order-status"
      style={{
        backgroundColor: colors.cream,
        height: '100dvh',
        padding: `${spacing.lg} ${spacing.lg} max(${spacing.lg}, env(safe-area-inset-bottom))`,
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
          progress={progress}
          onVideoComplete={handleVideoComplete}
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

      {/* Debug info (remove in production) */}
      <div style={{ marginTop: spacing.xl, fontSize: '12px', opacity: 0.5 }}>
        Stage: {currentStage}/6 | View: {currentView}
      </div>
    </div>
  )
}
