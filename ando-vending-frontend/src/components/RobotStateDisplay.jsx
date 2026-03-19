import './RobotStateDisplay.css'

const ROBOT_STATES = {
  Idle: {
    emoji: '🐕',
    posture: 'lying',
    light: 'white-pulse',
    sound: '🔇 Ambient sounds',
    animation: 'idle-breathing',
  },
  Selection: {
    emoji: '🐕‍🦺',
    posture: 'sitting',
    light: 'golden-solid',
    sound: '🔔 Wind chime',
    animation: 'head-tilt',
  },
  Purchase: {
    emoji: '🐕‍🦺',
    posture: 'standing',
    light: 'amber-solid',
    sound: '🔊 Gong',
    animation: 'tail-wag-fast',
  },
  Preparation: {
    emoji: '🐕‍🦺',
    posture: 'stretching',
    light: 'amber-pulse',
    sound: '🎵 Zen music',
    animation: 'stretch-sway',
  },
  Fulfillment: {
    emoji: '🐕‍🦺',
    posture: 'sitting',
    light: 'amber-bright',
    sound: '🪨 Moving rocks',
    animation: 'point-window',
  },
  Conclusion: {
    emoji: '🐕',
    posture: 'bowing',
    light: 'white-pulse',
    sound: '🔇 Zen music',
    animation: 'bow-animation',
  },
}

export default function RobotStateDisplay({ state = 'Idle' }) {
  const stateData = ROBOT_STATES[state] || ROBOT_STATES.Idle

  return (
    <div className={`robot-display state-${state.toLowerCase()}`}>
      <div className="lighting-aura" style={{ animation: `${stateData.animation} 2s infinite` }}>
        {/* Lighting effect background */}
      </div>

      <div className={`robot-container animation-${stateData.animation}`}>
        {/* Robot visual representation */}
        <div className="robot">
          <div className="robot-head">
            <div className="robot-eyes">
              <span className="eye">●</span>
              <span className="eye">●</span>
            </div>
          </div>

          <div className={`robot-body posture-${stateData.posture}`}>
            <div className="robot-torso"></div>
            <div className="robot-legs">
              <div className="leg"></div>
              <div className="leg"></div>
              <div className="leg"></div>
              <div className="leg"></div>
            </div>
            <div className="robot-tail">
              <span>▬</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`light-indicator light-${stateData.light}`}></div>

      <div className="state-info">
        <div className="state-name">{state}</div>
        <div className="state-details">
          <p className="emoji-icon">{stateData.emoji}</p>
          <p className="posture">{stateData.posture}</p>
          <p className="sound">{stateData.sound}</p>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="stage-indicators">
        {Object.keys(ROBOT_STATES).map((stageName, index) => (
          <div
            key={stageName}
            className={`stage-dot ${state === stageName ? 'active' : ''}`}
            title={stageName}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  )
}
