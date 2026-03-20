import { useEffect, useRef, useState } from 'react'
import './ScanQRZen.css'

export default function ScanQRZen({ drink, orderId, onScanComplete, onCancel }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    startCamera()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setScanning(true)
      setCameraReady(true)
      intervalRef.current = setInterval(() => scanFrame(), 500)
    } catch (err) {
      console.warn('Camera not available:', err.message)
    }
  }

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    if ('BarcodeDetector' in window) {
      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      detector.detect(canvas).then(barcodes => {
        if (barcodes.length > 0) handleQRDetected(barcodes[0].rawValue)
      }).catch(() => {})
    }
  }

  const handleQRDetected = (data) => {
    stopCamera()
    setScanning(false)
    if (navigator.vibrate) navigator.vibrate([50, 30, 50])
    onScanComplete(data)
  }

  const handleManualStart = () => {
    stopCamera()
    setScanning(false)
    if (navigator.vibrate) navigator.vibrate([50, 30, 50])
    onScanComplete('manual-trigger')
  }

  const drinkName = drink?.drinkName || 'Your Drink'

  return (
    <div className="zen-scan">
      <div className="master-card">
        {/* TOP GROUP: Logo + Brand + Instructions */}
        <div className="scan-top-group">
          <img src="/ando-logo.png" alt="Ando Tea House" className="scan-logo" />
          <span className="scan-brand-text">Ando Tea House</span>
          <div className="scan-heading-block">
            <h2 className="scan-heading">Scan Vending Machine QR</h2>
            <p className="scan-instruction">
              Position the machine's code within the frame to craft your {drinkName}
            </p>
          </div>
        </div>

        {/* MIDDLE GROUP: Camera */}
        <div className="scan-camera-group">
          {cameraReady ? (
            <div className="scan-viewfinder">
              <video ref={videoRef} className="scan-video" playsInline muted />
              <canvas ref={canvasRef} className="scan-canvas" />
              <div className="viewfinder-corners">
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />
              </div>
              {scanning && <div className="scan-line" />}
            </div>
          ) : (
            <div className="scan-qr-placeholder">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#797D76" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="8" height="8" rx="1" />
                <rect x="14" y="2" width="8" height="8" rx="1" />
                <rect x="2" y="14" width="8" height="8" rx="1" />
                <rect x="5" y="5" width="2" height="2" />
                <rect x="17" y="5" width="2" height="2" />
                <rect x="5" y="17" width="2" height="2" />
                <rect x="14" y="14" width="2" height="2" />
                <rect x="18" y="14" width="2" height="2" />
                <rect x="14" y="18" width="2" height="2" />
                <rect x="18" y="18" width="2" height="2" />
              </svg>
            </div>
          )}
        </div>

        {/* BOTTOM GROUP: Info + Actions */}
        <div className="scan-bottom-group">
          <div className="scan-info-actions">
            <span className="scan-order-badge">{drink?.size} · ${drink?.price?.toFixed(2)}</span>
            <button onClick={handleManualStart} className="scan-skip-link">
              {cameraReady ? 'Start without scanning' : 'Begin preparation'}
            </button>
          </div>

          <button onClick={onCancel} className="scan-goback-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
