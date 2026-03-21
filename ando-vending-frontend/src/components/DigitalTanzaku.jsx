import { useState, useEffect, useRef, useCallback } from 'react'
import TanzakuARScene from './TanzakuARScene'
import './DigitalTanzaku.css'

/**
 * Digital Tanzaku — The Zen Haiku AR Experience
 *
 * Properly sequenced with the preparation video:
 *   - Appears as an overlay during preparation
 *   - Video continues playing underneath
 *   - Print/Let-go choice only appears after preparation is complete
 *   - Elevator pauses when prep is done and user is still deciding
 *   - After user decides → elevator resumes → parent transitions to fulfillment
 *
 * Phases:
 *   IDLE         → Waiting for 3s timer
 *   PROMPT       → "Would you like to enter the grove?"
 *   INPUT        → Text input for user's thought
 *   WEAVING      → "Weaving your thought..." (LLM generating)
 *   AR           → Bamboo grove scene (waiting for prep to finish)
 *   PRINT_CHOICE → "Would you like to keep this thought?" (prep is done)
 *   FLYING_AWAY  → Fly-away animation playing
 */

const PHASES = {
  IDLE: 'IDLE',
  PROMPT: 'PROMPT',
  INPUT: 'INPUT',
  WEAVING: 'WEAVING',
  AR: 'AR',
  PRINT_CHOICE: 'PRINT_CHOICE',
  FLYING_AWAY: 'FLYING_AWAY',
}

const API_BASE = ''

export default function DigitalTanzaku({
  drinkName,
  preparationComplete,  // boolean: true when video/prep has finished
  onEngaged,            // called when user opts in (clicks "Enter the Grove")
  onDecisionComplete,   // called after fly-away finishes → parent transitions to fulfillment
}) {
  const [phase, setPhase] = useState(PHASES.IDLE)
  const [userThought, setUserThought] = useState('')
  const [haiku, setHaiku] = useState(null)
  const [groveHaikus, setGroveHaikus] = useState([])
  const [fadeClass, setFadeClass] = useState('')
  const [inputSubmitted, setInputSubmitted] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [arReady, setArReady] = useState(false) // stalk has grown, slip visible
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const arSceneRef = useRef(null)

  // ── Phase 1: 3-second opt-in timer ──
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setPhase(PHASES.PROMPT)
    }, 3000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // ── Auto-focus input ──
  useEffect(() => {
    if (phase === PHASES.INPUT && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 600)
      return () => clearTimeout(t)
    }
  }, [phase])

  // ── When preparation finishes AND we're in AR → show print choice ──
  useEffect(() => {
    if (preparationComplete && phase === PHASES.AR && arReady) {
      // Pause elevator — user needs to decide
      fetch(`${API_BASE}/api/elevator/pause`, { method: 'POST' }).catch(() => {})
      // Transition to print choice
      setPhase(PHASES.PRINT_CHOICE)
    }
  }, [preparationComplete, phase, arReady])

  // ── Fetch grove ──
  const fetchGrove = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/haiku-grove`)
      if (res.ok) {
        const data = await res.json()
        setGroveHaikus(data.haikus || [])
      }
    } catch (err) {
      console.warn('Could not fetch haiku grove:', err)
    }
  }, [])

  // ── User clicks "Enter the Grove" ──
  const handleBeginReflection = useCallback(() => {
    fetchGrove()
    if (onEngaged) onEngaged() // tell parent: user opted in
    setFadeClass('tanzaku-fade-out')
    setTimeout(() => {
      setPhase(PHASES.INPUT)
      setFadeClass('tanzaku-fade-in')
    }, 500)
  }, [fetchGrove, onEngaged])

  // ── User submits thought → LLM ──
  const handleSubmitThought = useCallback(async () => {
    if (!userThought.trim() || inputSubmitted) return
    setInputSubmitted(true)

    setFadeClass('tanzaku-fade-out')
    setTimeout(() => {
      setPhase(PHASES.WEAVING)
      setFadeClass('tanzaku-fade-in')
    }, 500)

    try {
      const response = await fetch(`${API_BASE}/api/generate-haiku`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought: userThought.trim() }),
      })

      if (!response.ok) throw new Error('Haiku generation failed')

      const data = await response.json()
      const haikuLines = data.haiku.split('\n').filter(line => line.trim())

      setTimeout(() => {
        setHaiku(haikuLines)
        setFadeClass('tanzaku-fade-out')
        setTimeout(() => {
          setPhase(PHASES.AR)
          setFadeClass('tanzaku-fade-in')
          // Mark AR as ready quickly so print choice can appear
          setTimeout(() => setArReady(true), 1500)
        }, 600)
      }, 1500)
    } catch (err) {
      console.error('Haiku API error:', err)
      const fallback = [
        'A quiet thought stirs',
        'like wind across still water',
        'then gently dissolves',
      ]
      setTimeout(() => {
        setHaiku(fallback)
        setFadeClass('tanzaku-fade-out')
        setTimeout(() => {
          setPhase(PHASES.AR)
          setFadeClass('tanzaku-fade-in')
          setTimeout(() => setArReady(true), 4000)
        }, 600)
      }, 1500)
    }
  }, [userThought, inputSubmitted])

  // ── Enter key ──
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmitThought() }
  }

  // ── Fly-away complete → resume elevator → tell parent ──
  const handleFlyAwayComplete = useCallback(async () => {
    // Resume elevator
    try {
      await fetch(`${API_BASE}/api/elevator/resume`, { method: 'POST' })
    } catch (err) {
      console.warn('Elevator resume failed (dev mode):', err)
    }

    // Brief pause, then tell parent to transition to fulfillment
    setTimeout(() => {
      if (onDecisionComplete) onDecisionComplete()
    }, 800)
  }, [onDecisionComplete])

  // ── "Let it go" ──
  const handleLetItGo = useCallback(() => {
    setPhase(PHASES.FLYING_AWAY)
    if (arSceneRef.current) {
      arSceneRef.current.triggerFlyAway('release')
    }
  }, [])

  // ── "Print Haiku" ──
  const handlePrintHaiku = useCallback(async () => {
    if (!haiku || isPrinting) return
    setIsPrinting(true)

    try {
      await fetch(`${API_BASE}/api/printer/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ haiku: haiku.join('\n'), order_id: null }),
      })
    } catch (err) {
      console.warn('Print failed (dev mode):', err)
    }

    setPhase(PHASES.FLYING_AWAY)
    if (arSceneRef.current) {
      arSceneRef.current.triggerFlyAway('print')
    }
  }, [haiku, isPrinting])

  /* ============================
     RENDER BY PHASE
     ============================ */

  if (phase === PHASES.IDLE) return null

  // PROMPT — overlays preparation screen
  if (phase === PHASES.PROMPT) {
    return (
      <div className={`tanzaku-overlay tanzaku-prompt ${fadeClass}`}>
        <div className="tanzaku-prompt-content">
          <p className="tanzaku-prompt-text">
            A bamboo grove grows here,
            <br />
            woven from the whispers
            <br />
            of those who waited before you.
          </p>
          <p className="tanzaku-prompt-sub">
            Share a thought and we'll craft a haiku just for you,
            hung in our digital bamboo grove while we whisk your {drinkName || 'tea'}.
          </p>
          <button className="tanzaku-begin-btn" onClick={handleBeginReflection}>
            Enter the Grove
          </button>
          <button
            className="tanzaku-dismiss-btn"
            onClick={() => {
              setFadeClass('tanzaku-fade-out')
              setTimeout(() => setPhase(PHASES.IDLE), 500)
            }}
          >
            Continue without
          </button>
        </div>
      </div>
    )
  }

  // INPUT
  if (phase === PHASES.INPUT) {
    return (
      <div className={`tanzaku-overlay tanzaku-input-phase ${fadeClass}`}>
        <div className="tanzaku-input-content">
          <p className="tanzaku-question">What is on your mind today?</p>
          <div className="tanzaku-input-line">
            <input
              ref={inputRef}
              type="text"
              className="tanzaku-text-input"
              value={userThought}
              onChange={(e) => setUserThought(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="A feeling, a memory, a wish..."
              maxLength={200}
              autoComplete="off"
              autoCapitalize="sentences"
            />
            <div className="tanzaku-input-underline" />
          </div>
          <button
            className="tanzaku-submit-btn"
            onClick={handleSubmitThought}
            disabled={!userThought.trim() || inputSubmitted}
          >
            Offer This Thought
          </button>
        </div>
      </div>
    )
  }

  // WEAVING
  if (phase === PHASES.WEAVING) {
    return (
      <div className={`tanzaku-overlay tanzaku-weaving ${fadeClass}`}>
        <div className="tanzaku-weaving-content">
          <p className="tanzaku-weaving-text">Weaving your thought...</p>
          <div className="tanzaku-weaving-dots">
            <span className="weaving-dot" />
            <span className="weaving-dot" />
            <span className="weaving-dot" />
          </div>
        </div>
      </div>
    )
  }

  // AR / PRINT_CHOICE / FLYING_AWAY — Three.js scene
  if (phase === PHASES.AR || phase === PHASES.PRINT_CHOICE || phase === PHASES.FLYING_AWAY) {
    return (
      <div className={`tanzaku-overlay tanzaku-ar-phase ${fadeClass}`}>
        <TanzakuARScene
          ref={arSceneRef}
          haiku={haiku}
          groveHaikus={groveHaikus}
          onFlyAwayComplete={handleFlyAwayComplete}
        />

        {/* Print Choice — only shows after preparation is complete */}
        {phase === PHASES.PRINT_CHOICE && (
          <div className="tanzaku-print-overlay">
            <div className="tanzaku-print-content">
              <p className="tanzaku-print-question">
                Would you like to keep this thought?
              </p>
              <div className="tanzaku-print-buttons">
                <button
                  className="tanzaku-print-btn"
                  onClick={handlePrintHaiku}
                  disabled={isPrinting}
                >
                  {isPrinting ? 'Printing...' : 'Print Haiku'}
                </button>
                <button className="tanzaku-letgo-btn" onClick={handleLetItGo}>
                  Let it go
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flying away status */}
        {phase === PHASES.FLYING_AWAY && (
          <div className="tanzaku-flyaway-status">
            <p className="tanzaku-flyaway-text">
              {isPrinting ? 'Your thought takes form...' : 'Returning to the wind...'}
            </p>
          </div>
        )}

        {/* AR footer — while waiting for prep to finish */}
        {phase === PHASES.AR && (
          <div className="tanzaku-ar-footer">
            <p className="tanzaku-ar-tether">Your thought hangs in the clearing</p>
            <p className="tanzaku-ar-hint">The Bamboo Grove</p>
          </div>
        )}
      </div>
    )
  }

  return null
}
