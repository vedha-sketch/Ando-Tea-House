import { useEffect, useRef, useState } from 'react'
import { colors, spacing, borderRadius } from '../styles/design-system'
import './ScanQRZen.css'

export default function ScanQRZen({ onSessionStart }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualId, setManualId] = useState('')
  const [cameraAvailable, setCameraAvailable] = useState(true)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    let jsQR = null
    let interval = null

    const startCamera = async () => {
      try {
        const module = await import('jsqr')
        jsQR = module.default

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          interval = startScanning(jsQR)
        }
      } catch (err) {
        setCameraAvailable(false)
        setShowManualInput(true)
        console.error(err)
      }
    }

    startCamera()

    return () => {
      if (interval) clearInterval(interval)
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startScanning = (jsQR) => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && jsQR) {
        const canvas = canvasRef.current
        const video = videoRef.current
        const ctx = canvas.getContext('2d')

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        ctx.drawImage(video, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code && !scanned) {
          setScanned(true)
          clearInterval(interval)
          handleQRCodeScanned(code.data)
        }
      }
    }, 100)

    return interval
  }

  const handleQRCodeScanned = (data) => {
    const sessionId = data.split(':')[0] || data
    setValidating(true)

    fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${sessionId}`, {
      method: 'GET',
    })
      .then(res => {
        if (res.ok) {
          onSessionStart(sessionId)
        } else {
          setError('Invalid QR code. Please try again.')
          setScanned(false)
        }
      })
      .catch(() => {
        console.warn('Backend unreachable, starting session locally')
        onSessionStart(sessionId)
      })
      .finally(() => setValidating(false))
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    const id = manualId.trim()
    if (id) {
      handleQRCodeScanned(id)
    }
  }

  return (
    <div
      className="zen-scan"
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
      <div className="scan-card">
        {/* Header */}
        <div className="scan-header">
          <h1>Welcome to Ando</h1>
          <p>Scan the QR code on the machine to begin</p>
        </div>

        {error && <div className="error-message-zen">{error}</div>}

        {/* Camera view */}
        {cameraAvailable && (
          <div className="camera-frame">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-feed"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {!scanned && <div className="scan-overlay-zen" />}
            {scanned && <div className="scan-success-zen">✓ QR Code Scanned</div>}
          </div>
        )}

        {!cameraAvailable && (
          <div className="camera-frame">
            <div className="camera-placeholder-zen">
              <div className="placeholder-icon">📱</div>
              <p>Camera not available</p>
              <p className="placeholder-hint">Enter your session ID below</p>
            </div>
          </div>
        )}

        {/* Input/Actions */}
        {showManualInput ? (
          <form onSubmit={handleManualSubmit} className="manual-form-zen">
            <input
              type="text"
              placeholder="Enter Session ID"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              disabled={validating}
              autoFocus
              className="session-input"
            />
            <button
              type="submit"
              disabled={validating || !manualId.trim()}
              className="connect-button"
              style={{
                backgroundColor: validating || !manualId.trim() ? colors.stone300 : colors.matcha,
                color: colors.white,
              }}
            >
              {validating ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowManualInput(true)}
            className="enter-manually-btn"
          >
            Enter ID Manually
          </button>
        )}

        {/* Dev mode button */}
        <button
          onClick={() => onSessionStart(`dev-${Date.now()}`)}
          className="dev-mode-btn"
        >
          Skip — Dev Mode
        </button>
      </div>
    </div>
  )
}
