import { useState, useEffect, useRef, useCallback } from 'react'
import DigitalTanzaku from '../components/DigitalTanzaku'
import './OrderStatusZen.css'

const ando = {
  cream: '#F2F0E9',
  forest: '#697062',
  olive: '#556B2F',
  muted: '#9c9a8e',
  matcha: '#738065',
  ringBg: '#eae7df',
}

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
    <>
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
    </>
  )
}

function FulfillmentView({ drink, orderId, onPickup }) {
  useEffect(() => {
    triggerHaptic('ready')
  }, [])

  return (
    <>
      <div className="card-center fulfillment-center">
        <div className="ready-badge">
          <span className="ready-dot pulse" />
          Ready
        </div>

        <h1 className="fulfillment-title">Your Drink Awaits</h1>
        <p className="fulfillment-subtitle">
          {drink.drinkName} · {drink.size}
        </p>
      </div>

      <div className="fulfillment-footer">
        <span className="order-footer-text">Order {orderId}</span>
        <button onClick={onPickup} className="dev-skip-link">
          [ Dev: Skip to Success ]
        </button>
      </div>
    </>
  )
}

/**
 * OrderStatusZen — Preparation → Tanzaku → Fulfillment
 *
 * Sequencing logic:
 *   1. PREPARATION view plays (video + progress ring)
 *   2. Tanzaku prompt appears 3s in as an overlay
 *   3a. User IGNORES tanzaku → video ends → FULFILLMENT
 *   3b. User ENGAGES tanzaku → video continues underneath → tanzaku takes over screen
 *       → When video ends: tanzaku waits, elevator pauses
 *       → User makes print/let-go decision → elevator resumes → FULFILLMENT
 */
export default function OrderStatusZen({ orderId, orderData, onOrderComplete }) {
  const [progress, setProgress] = useState(0)
  const [currentView, setCurrentView] = useState('PREPARATION') // PREPARATION | FULFILLMENT
  const [preparationComplete, setPreparationComplete] = useState(false)
  const tanzakuEngagedRef = useRef(false) // ref so video callback always reads latest
  const videoRef = useRef(null)

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current
      if (duration > 0) setProgress((currentTime / duration) * 100)
    }
  }

  const handleVideoComplete = useCallback(() => {
    setProgress(100)
    setPreparationComplete(true)

    // Check the ref (not state) so we always see the latest value
    if (!tanzakuEngagedRef.current) {
      // User did NOT engage with tanzaku → go straight to fulfillment
      setCurrentView('FULFILLMENT')
      triggerHaptic('ready')
    }
    // If user IS engaged → tanzaku component will detect
    // preparationComplete=true and show print/let-go choice.
  }, []) // no dependency on state — uses ref instead

  // Called when user clicks "Enter the Grove"
  const handleTanzakuEngaged = useCallback(() => {
    tanzakuEngagedRef.current = true
  }, [])

  // Called after fly-away animation completes (user printed or let go)
  const handleTanzakuDecisionComplete = useCallback(() => {
    setCurrentView('FULFILLMENT')
    triggerHaptic('ready')
  }, [])

  const drink = orderData || { drinkName: 'Your Drink', size: 'Standard' }
  const videoUrl = orderData?.videoUrl || null

  return (
    <div className="zen-order-status">
      <div className="master-card" style={{ position: 'relative' }}>
        {/* TOP: Brand block */}
        <div className="card-top">
          <div className="brand-block">
            <img src="/ando-logo.png" alt="Ando Tea House" className="brand-logo" />
            <span className="brand-name">Ando Tea House</span>
          </div>
          <div className="brand-divider" />
        </div>

        {currentView === 'PREPARATION' ? (
          <div className="card-center preparation-view">
            <PreparationView
              drink={drink}
              videoUrl={videoUrl}
              videoRef={videoRef}
              progress={progress}
              onVideoComplete={handleVideoComplete}
              onVideoTimeUpdate={handleVideoTimeUpdate}
            />
            {/* Tanzaku overlays preparation — video keeps playing underneath */}
            <DigitalTanzaku
              drinkName={drink.drinkName}
              preparationComplete={preparationComplete}
              onEngaged={handleTanzakuEngaged}
              onDecisionComplete={handleTanzakuDecisionComplete}
            />
          </div>
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
