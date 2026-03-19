import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import './ScanQR.css'

export default function ScanQR({ onSessionStart }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          startScanning()
        }
      } catch (err) {
        setError('Unable to access camera. Please allow camera permissions.')
        console.error(err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startScanning = () => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
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

    return () => clearInterval(interval)
  }

  const handleQRCodeScanned = (data) => {
    // QR code format: session_id:machine_id
    // For now, assume the entire data is the session_id
    const sessionId = data.split(':')[0] || data

    // Validate with backend
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
      .catch(err => {
        setError('Failed to validate session. Please try again.')
        setScanned(false)
        console.error(err)
      })
  }

  return (
    <div className="page-content">
      <div className="page-inner">
        <div className="scan-container">
          <h1>Scan QR Code</h1>
          <p>Position the QR code on the vending machine in view of your camera.</p>

          {error && <div className="error-message">{error}</div>}

          <div className="camera-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-feed"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {!scanned && <div className="scan-overlay" />}
            {scanned && <div className="scan-success">✓ QR Code scanned!</div>}
          </div>

          <button
            onClick={() => {
              // Fallback: manually enter session ID
              const sessionId = prompt('Enter Session ID:')
              if (sessionId) {
                handleQRCodeScanned(sessionId)
              }
            }}
            className="secondary-button"
          >
            Enter ID Manually
          </button>
        </div>
      </div>
    </div>
  )
}
