import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'

/**
 * TanzakuARScene — Ethereal Bamboo Grove v7
 *
 * Dense bamboo forest with leaves, fireflies, hanging tanzaku papers.
 * Center clearing for the dog house / camera. Leaves sway with wind.
 * Exposes triggerFlyAway() via ref for the print/let-go flow.
 */

// ── Palette ──
const BAMBOO_DARK  = 0x3d5a35
const BAMBOO_MID   = 0x527248
const BAMBOO_LIGHT = 0x6b8f5e
const NODE_RING    = 0x344d2e
const LEAF_DARK    = 0x3a6b2a
const LEAF_MID     = 0x4d8a38
const LEAF_LIGHT   = 0x68a84a
const LEAF_YELLOW  = 0x8aaa44
const TEXT_INK     = '#1A1C18'   // dark Sumi-e ink
const TEXT_INK_C   = '#2a2c28'   // communal — still high contrast
const USER_GLOW    = 0xf5e6c8
const FF_WARM      = 0xffe4a0
const FF_GREEN     = 0xc8f0a0
const FF_GOLD      = 0xffd080

const TanzakuARScene = forwardRef(function TanzakuARScene({ haiku, groveHaikus = [], onFlyAwayComplete }, ref) {
  const containerRef = useRef(null)
  const videoRef     = useRef(null)
  const rendererRef  = useRef(null)
  const frameRef     = useRef(null)
  const streamRef    = useRef(null)
  const cleanupRef   = useRef(null)
  const clockRef     = useRef(new THREE.Clock())
  const flyAwayRef   = useRef(null) // stores { active, startTime, slip, stalk }

  // ─── PAPER TEXTURE ───
  const createPaperTexture = useCallback((lines, isUser = false) => {
    const canvas = document.createElement('canvas')
    const ctx    = canvas.getContext('2d')
    const dpr    = Math.min(window.devicePixelRatio || 1, 2)
    const W = 400, H = 660
    canvas.width = W * dpr; canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    // White paper
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // Grain
    ctx.globalAlpha = 0.02
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = '#d0d0d0'
      ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
    }
    ctx.globalAlpha = 1

    // Fiber lines
    ctx.globalAlpha = 0.012
    ctx.strokeStyle = '#c0b8a0'
    for (let i = 0; i < 8; i++) {
      ctx.beginPath()
      ctx.moveTo(0, Math.random() * H)
      ctx.bezierCurveTo(W * 0.3, Math.random() * H, W * 0.7, Math.random() * H, W, Math.random() * H)
      ctx.lineWidth = 0.5; ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Top accent
    ctx.strokeStyle = isUser ? '#697062' : '#c0bdb5'
    ctx.lineWidth = isUser ? 1.5 : 1
    ctx.globalAlpha = isUser ? 0.7 : 0.35
    ctx.beginPath(); ctx.moveTo(W / 2 - 50, 65); ctx.lineTo(W / 2 + 50, 65); ctx.stroke()
    ctx.globalAlpha = 1

    // Hole punch
    ctx.fillStyle = 'rgba(0,0,0,0.05)'
    ctx.beginPath(); ctx.arc(W / 2, 32, 5, 0, Math.PI * 2); ctx.fill()

    // Bold text
    const fontSize = isUser ? 34 : 28
    const lineGap  = isUser ? 85 : 72
    const totalH   = (lines.length - 1) * lineGap
    const startY   = H / 2 - totalH / 2 + 20

    ctx.fillStyle    = isUser ? TEXT_INK : TEXT_INK_C
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `600 ${fontSize}px "Playfair Display", Georgia, serif`

    lines.forEach((line, i) => {
      const y = startY + i * lineGap
      const maxW = W - 36, words = line.split(' ')
      let cur = '', wrapped = []
      words.forEach(w => {
        const test = cur ? cur + ' ' + w : w
        if (ctx.measureText(test).width > maxW && cur) { wrapped.push(cur); cur = w }
        else cur = test
      })
      if (cur) wrapped.push(cur)
      wrapped.forEach((wl, wi) => ctx.fillText(wl, W / 2, y + wi * (fontSize + 8)))
    })

    // Bottom dot
    ctx.globalAlpha = 0.2
    ctx.fillStyle = isUser ? '#697062' : '#b0ada5'
    ctx.beginPath(); ctx.arc(W / 2, startY + lines.length * lineGap + 30, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1

    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter
    return tex
  }, [])

  // ─── HANGING SLIP ───
  const createHangingSlip = useCallback((lines, stalkGroup, attachHeight, isUser = false) => {
    const group = new THREE.Group()
    const texture = createPaperTexture(lines, isUser)

    const slipW = isUser ? 0.55 : 0.38
    const slipH = slipW * (660 / 400)

    const geo = new THREE.PlaneGeometry(slipW, slipH)
    const mat = new THREE.MeshStandardMaterial({
      map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0,
      roughness: 0.85, metalness: 0,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: isUser ? 0.08 : 0.03,
    })
    group.add(new THREE.Mesh(geo, mat))

    // String
    const stringLen = 0.1 + Math.random() * 0.05
    const sGeo = new THREE.CylinderGeometry(0.002, 0.002, stringLen, 4)
    const sMat = new THREE.MeshBasicMaterial({
      color: isUser ? 0x8b7355 : 0x9a9585, transparent: true, opacity: 0,
    })
    const string = new THREE.Mesh(sGeo, sMat)
    string.position.y = slipH / 2 + stringLen / 2
    group.add(string)

    // Position in front of stalk
    const sx = stalkGroup.position.x
    const sz = stalkGroup.position.z
    const side = (Math.random() > 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.03)
    group.position.set(sx + side, attachHeight - slipH / 2 - stringLen, sz + 0.15)

    group.userData = {
      slipMat: mat, stringMat: sMat, texture, geo, stringGeo: sGeo,
      slipH, stringLen, isUser,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.18 + Math.random() * 0.12,
    }
    return group
  }, [createPaperTexture])

  // ─── LEAF CLUSTER ───
  // Creates 3-6 thin elongated leaves sprouting from a bamboo node
  const createLeafCluster = useCallback((nodeY, stalkRadius, stalkColor) => {
    const group = new THREE.Group()
    group.position.y = nodeY

    const leafCount = 2 + Math.floor(Math.random() * 4) // 2-5 leaves
    const leafColors = [LEAF_DARK, LEAF_MID, LEAF_LIGHT, LEAF_YELLOW]

    for (let i = 0; i < leafCount; i++) {
      // Each leaf: thin tapered shape via custom geometry
      const leafLen = 0.15 + Math.random() * 0.2
      const leafWid = 0.02 + Math.random() * 0.015

      // Use a simple triangle-ish shape (PlaneGeometry is fine, tapered via vertices)
      const shape = new THREE.Shape()
      shape.moveTo(0, 0)
      shape.quadraticCurveTo(leafWid * 0.7, leafLen * 0.3, leafWid * 0.3, leafLen * 0.7)
      shape.lineTo(0, leafLen)
      shape.lineTo(-leafWid * 0.3, leafLen * 0.7)
      shape.quadraticCurveTo(-leafWid * 0.7, leafLen * 0.3, 0, 0)

      const leafGeo = new THREE.ShapeGeometry(shape, 1)
      const color = leafColors[Math.floor(Math.random() * leafColors.length)]
      const leafMat = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.25,
        roughness: 0.7,
        metalness: 0,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.03,
      })

      const leaf = new THREE.Mesh(leafGeo, leafMat)

      // Radial direction from stalk center
      const angle = (Math.PI * 2 / leafCount) * i + (Math.random() - 0.5) * 0.8
      leaf.position.x = Math.cos(angle) * (stalkRadius + 0.005)
      leaf.position.z = Math.sin(angle) * (stalkRadius + 0.005)

      // Tilt outward + droop
      leaf.rotation.z = -0.3 - Math.random() * 0.6 // droop downward
      leaf.rotation.y = angle // face outward
      leaf.rotation.x = (Math.random() - 0.5) * 0.3

      // Store for wind animation
      leaf.userData = {
        baseRotZ: leaf.rotation.z,
        baseRotX: leaf.rotation.x,
        windPhase: Math.random() * Math.PI * 2,
        windSpeed: 0.4 + Math.random() * 0.6,
        windAmount: 0.08 + Math.random() * 0.12,
      }

      group.add(leaf)
    }

    group.userData = {
      windPhase: Math.random() * Math.PI * 2,
      windSpeed: 0.3 + Math.random() * 0.4,
    }

    return group
  }, [])

  // ─── BAMBOO STALK (with leaves) ───
  const createBambooStalk = useCallback((height, opts = {}) => {
    const {
      radius = 0.025 + Math.random() * 0.02,
      color  = BAMBOO_MID,
      opacity = 0.7,
      emissiveIntensity = 0.03,
      addLeaves = true,
    } = opts

    const group = new THREE.Group()
    const segments = 8

    // Main cylinder
    const stalkGeo = new THREE.CylinderGeometry(radius * 0.93, radius * 1.07, height, segments, 1, true)
    const stalkMat = new THREE.MeshPhysicalMaterial({
      color, transparent: true, opacity, roughness: 0.3, metalness: 0.05,
      transmission: 0.12, thickness: 0.2, side: THREE.DoubleSide,
      emissive: new THREE.Color(color), emissiveIntensity,
    })
    const stalk = new THREE.Mesh(stalkGeo, stalkMat)
    stalk.position.y = height / 2
    group.add(stalk)

    // Node rings + optional leaf clusters
    const nodeSpacing = 0.55 + Math.random() * 0.25
    const nodeCount = Math.floor(height / nodeSpacing)
    const leafClusters = []

    for (let n = 1; n <= nodeCount; n++) {
      const nodeY = n * nodeSpacing + (Math.random() - 0.5) * 0.06
      if (nodeY > height - 0.2) continue

      // Ring
      const nodeGeo = new THREE.TorusGeometry(radius + 0.005, 0.003, 6, segments)
      const nodeMat = new THREE.MeshStandardMaterial({
        color: NODE_RING, transparent: true, opacity: opacity * 0.7, roughness: 0.4,
      })
      const node = new THREE.Mesh(nodeGeo, nodeMat)
      node.position.y = nodeY; node.rotation.x = Math.PI / 2
      group.add(node)

      // Leaves: randomly at ~40% of nodes, more likely higher up
      if (addLeaves && Math.random() < (0.3 + (nodeY / height) * 0.35)) {
        const cluster = createLeafCluster(nodeY, radius, color)
        group.add(cluster)
        leafClusters.push(cluster)
      }
    }

    // Top tuft: always add a small leaf cluster at the very top
    if (addLeaves && height > 2) {
      const topCluster = createLeafCluster(height - 0.1, radius, color)
      group.add(topCluster)
      leafClusters.push(topCluster)
    }

    group.userData = {
      stalkMat, height, radius, leafClusters,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.06 + Math.random() * 0.1,
      swayAmount: 0.003 + Math.random() * 0.006,
    }
    return group
  }, [createLeafCluster])

  // Expose triggerFlyAway to parent via ref
  useImperativeHandle(ref, () => ({
    triggerFlyAway: (mode = 'release') => {
      const fa = flyAwayRef.current
      if (fa && !fa.active) {
        fa.active = true
        fa.mode = mode // 'print' or 'release'
        fa.startTime = clockRef.current.getElapsedTime()
      }
    },
  }))

  // ─── MAIN SCENE ───
  useEffect(() => {
    if (!containerRef.current || !haiku || haiku.length === 0) return

    const container = containerRef.current
    let initTimeout

    const initScene = () => {
      // Camera feed
      const video = document.createElement('video')
      video.setAttribute('playsinline', ''); video.setAttribute('autoplay', ''); video.setAttribute('muted', '')
      video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;'
      container.appendChild(video)
      videoRef.current = video

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
        .then(stream => { streamRef.current = stream; video.srcObject = stream; video.play().catch(() => {}) })
        .catch(() => { video.style.background = 'linear-gradient(180deg, #1a2818 0%, #2a3828 50%, #1a2818 100%)' })

      // Renderer
      const W = container.clientWidth, H = container.clientHeight
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.3
      renderer.domElement.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;'
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Scene
      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x1a2818, 0.07)

      // Camera
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 60)
      camera.position.set(0, 1.6, 3.2)
      camera.lookAt(0, 1.8, -2)

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const sunlight = new THREE.DirectionalLight(0xf5e8c8, 0.7)
      sunlight.position.set(2, 8, 1); scene.add(sunlight)
      const fillLight = new THREE.DirectionalLight(0xc8d8e0, 0.3)
      fillLight.position.set(-3, 4, 2); scene.add(fillLight)
      const userLantern = new THREE.PointLight(USER_GLOW, 1.0, 3.5, 2)
      userLantern.position.set(0, 2.2, 0.5); scene.add(userLantern)
      const dappled = new THREE.PointLight(0xd4e8c0, 0.3, 10, 2)
      dappled.position.set(0, 3.5, -3); scene.add(dappled)

      // Add subtle green canopy light from above
      const canopyLight = new THREE.PointLight(0x88cc66, 0.2, 12, 2)
      canopyLight.position.set(0, 6, -1); scene.add(canopyLight)

      const allStalks = []
      const allSlips  = []

      // ─── PLANT HELPER ───
      const plantStalk = (x, z, hMin, hMax, colorHex, opacityVal) => {
        const h = hMin + Math.random() * (hMax - hMin)
        const stalk = createBambooStalk(h, {
          radius: 0.018 + Math.random() * 0.022,
          color: colorHex, opacity: opacityVal,
          emissiveIntensity: 0.02 + Math.random() * 0.02,
          addLeaves: true,
        })
        stalk.position.set(
          x + (Math.random() - 0.5) * 0.12,
          -1,
          z + (Math.random() - 0.5) * 0.2
        )
        stalk.rotation.z = (Math.random() - 0.5) * 0.025
        stalk.rotation.x = (Math.random() - 0.5) * 0.015
        scene.add(stalk)
        allStalks.push(stalk)
        return stalk
      }

      // ═══ LEFT WALL ═══
      // Foreground (Z: 1-2)
      plantStalk(-0.7, 1.8, 4, 5.5, BAMBOO_LIGHT, 0.8)
      plantStalk(-0.95, 1.4, 3.5, 5, BAMBOO_LIGHT, 0.75)
      plantStalk(-1.2, 1.6, 4.5, 6, BAMBOO_MID, 0.75)
      plantStalk(-1.45, 1.2, 3, 5, BAMBOO_MID, 0.7)
      plantStalk(-1.7, 1.7, 4, 5.5, BAMBOO_MID, 0.7)
      plantStalk(-1.95, 1.3, 3.5, 5.5, BAMBOO_DARK, 0.65)

      // Mid (Z: 0-1)
      plantStalk(-0.7, 0.6, 4, 6, BAMBOO_LIGHT, 0.75)
      plantStalk(-0.95, 0.2, 4.5, 6.5, BAMBOO_LIGHT, 0.7)
      plantStalk(-1.2, 0.8, 3.5, 5.5, BAMBOO_MID, 0.7)
      plantStalk(-1.5, 0.4, 5, 7, BAMBOO_MID, 0.65)
      plantStalk(-1.75, 0.0, 4, 6, BAMBOO_DARK, 0.6)
      plantStalk(-2.0, 0.7, 4.5, 6.5, BAMBOO_DARK, 0.6)

      // Deep (Z: -1 to 0)
      plantStalk(-0.75, -0.4, 5, 7, BAMBOO_MID, 0.65)
      plantStalk(-1.0, -0.8, 4.5, 7, BAMBOO_MID, 0.6)
      plantStalk(-1.3, -0.2, 5, 7.5, BAMBOO_DARK, 0.55)
      plantStalk(-1.6, -0.6, 4, 6.5, BAMBOO_DARK, 0.5)
      plantStalk(-1.9, -0.9, 5.5, 7.5, BAMBOO_DARK, 0.5)

      // Far (Z: -2 to -1)
      plantStalk(-0.8, -1.5, 5.5, 8, BAMBOO_DARK, 0.45)
      plantStalk(-1.1, -1.8, 6, 8.5, BAMBOO_DARK, 0.4)
      plantStalk(-1.5, -1.3, 5, 7.5, BAMBOO_DARK, 0.4)
      plantStalk(-1.8, -2.0, 6, 8, BAMBOO_DARK, 0.35)
      plantStalk(-2.1, -1.6, 5, 7, BAMBOO_DARK, 0.35)

      // Very far (Z: -3 to -2)
      plantStalk(-0.9, -2.5, 6, 9, BAMBOO_DARK, 0.3)
      plantStalk(-1.3, -3.0, 7, 9.5, BAMBOO_DARK, 0.25)
      plantStalk(-1.7, -2.8, 6, 8.5, BAMBOO_DARK, 0.22)
      plantStalk(-2.2, -3.2, 7, 9, BAMBOO_DARK, 0.2)

      // Backfill
      plantStalk(-1.0, -4.0, 7, 10, BAMBOO_DARK, 0.15)
      plantStalk(-1.6, -4.5, 8, 10, BAMBOO_DARK, 0.12)
      plantStalk(-2.3, -4.2, 7, 9, BAMBOO_DARK, 0.1)

      // ═══ RIGHT WALL (mirror) ═══
      plantStalk(0.7, 1.8, 4, 5.5, BAMBOO_LIGHT, 0.8)
      plantStalk(0.95, 1.4, 3.5, 5, BAMBOO_LIGHT, 0.75)
      plantStalk(1.2, 1.6, 4.5, 6, BAMBOO_MID, 0.75)
      plantStalk(1.45, 1.2, 3, 5, BAMBOO_MID, 0.7)
      plantStalk(1.7, 1.7, 4, 5.5, BAMBOO_MID, 0.7)
      plantStalk(1.95, 1.3, 3.5, 5.5, BAMBOO_DARK, 0.65)

      plantStalk(0.7, 0.6, 4, 6, BAMBOO_LIGHT, 0.75)
      plantStalk(0.95, 0.2, 4.5, 6.5, BAMBOO_LIGHT, 0.7)
      plantStalk(1.2, 0.8, 3.5, 5.5, BAMBOO_MID, 0.7)
      plantStalk(1.5, 0.4, 5, 7, BAMBOO_MID, 0.65)
      plantStalk(1.75, 0.0, 4, 6, BAMBOO_DARK, 0.6)
      plantStalk(2.0, 0.7, 4.5, 6.5, BAMBOO_DARK, 0.6)

      plantStalk(0.75, -0.4, 5, 7, BAMBOO_MID, 0.65)
      plantStalk(1.0, -0.8, 4.5, 7, BAMBOO_MID, 0.6)
      plantStalk(1.3, -0.2, 5, 7.5, BAMBOO_DARK, 0.55)
      plantStalk(1.6, -0.6, 4, 6.5, BAMBOO_DARK, 0.5)
      plantStalk(1.9, -0.9, 5.5, 7.5, BAMBOO_DARK, 0.5)

      plantStalk(0.8, -1.5, 5.5, 8, BAMBOO_DARK, 0.45)
      plantStalk(1.1, -1.8, 6, 8.5, BAMBOO_DARK, 0.4)
      plantStalk(1.5, -1.3, 5, 7.5, BAMBOO_DARK, 0.4)
      plantStalk(1.8, -2.0, 6, 8, BAMBOO_DARK, 0.35)
      plantStalk(2.1, -1.6, 5, 7, BAMBOO_DARK, 0.35)

      plantStalk(0.9, -2.5, 6, 9, BAMBOO_DARK, 0.3)
      plantStalk(1.3, -3.0, 7, 9.5, BAMBOO_DARK, 0.25)
      plantStalk(1.7, -2.8, 6, 8.5, BAMBOO_DARK, 0.22)
      plantStalk(2.2, -3.2, 7, 9, BAMBOO_DARK, 0.2)

      plantStalk(1.0, -4.0, 7, 10, BAMBOO_DARK, 0.15)
      plantStalk(1.6, -4.5, 8, 10, BAMBOO_DARK, 0.12)
      plantStalk(2.3, -4.2, 7, 9, BAMBOO_DARK, 0.1)

      // Center-back closing
      plantStalk(-0.3, -5.0, 7, 10, BAMBOO_DARK, 0.12)
      plantStalk(0.2, -5.5, 8, 10, BAMBOO_DARK, 0.1)
      plantStalk(-0.1, -6.5, 8, 11, BAMBOO_DARK, 0.08)

      // ═══ COMMUNAL SLIPS ═══
      const maxGrove = Math.min(groveHaikus.length, 6)
      const leftVis  = allStalks.filter(s => s.position.x < -0.5 && s.position.z > -2.5 && s.position.z < 1)
      const rightVis = allStalks.filter(s => s.position.x > 0.5 && s.position.z > -2.5 && s.position.z < 1)

      for (let i = 0; i < maxGrove; i++) {
        const entry = groveHaikus[groveHaikus.length - maxGrove + i]
        const lines = entry.haiku.split('\n').filter(l => l.trim())
        if (lines.length === 0) continue
        const pool  = i % 2 === 0 ? leftVis : rightVis
        const stalk = pool[i % pool.length] || allStalks[i + 3]
        if (!stalk) continue
        const attachY = (stalk.userData.height || 4) * 0.45 + Math.random() * 0.6
        const slip = createHangingSlip(lines, stalk, attachY, false)
        scene.add(slip); allSlips.push(slip)
      }

      // ═══ USER'S STALK + SLIP ═══
      const userX = 0.1, userZ = -0.3, userH = 5.0
      const userStalk = createBambooStalk(userH, {
        radius: 0.035, color: BAMBOO_LIGHT, opacity: 0.8,
        emissiveIntensity: 0.05, addLeaves: true,
      })
      userStalk.position.set(userX, -1, userZ)
      userStalk.scale.y = 0.001
      scene.add(userStalk); allStalks.push(userStalk)

      const userSlip = createHangingSlip(haiku, userStalk, userH * 0.5, true)
      userSlip.visible = false
      scene.add(userSlip); allSlips.push(userSlip)

      // Store refs for fly-away animation
      flyAwayRef.current = {
        active: false,
        mode: 'release', // 'print' or 'release'
        startTime: 0,
        slip: userSlip,
        stalk: userStalk,
        baseY: userSlip.position.y,
        baseX: userSlip.position.x,
        baseZ: userSlip.position.z,
        completed: false,
        particles: null, // created on first frame of 'release'
      }

      // ═══ FIREFLIES ═══
      const fireflyCount = 18
      const fireflies = []
      const ffColors = [FF_WARM, FF_GREEN, FF_GOLD]

      for (let i = 0; i < fireflyCount; i++) {
        const color = ffColors[i % ffColors.length]
        const light = new THREE.PointLight(color, 0, 1.5, 2)
        light.position.set(
          (Math.random() - 0.5) * 4,
          0.5 + Math.random() * 3.5,
          Math.random() * -4 + 1.5
        )
        scene.add(light)

        const dotGeo = new THREE.SphereGeometry(0.008, 6, 6)
        const dotMat = new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
        const dot = new THREE.Mesh(dotGeo, dotMat)
        dot.position.copy(light.position)
        scene.add(dot)

        fireflies.push({
          light, dot, dotMat,
          baseX: light.position.x, baseY: light.position.y, baseZ: light.position.z,
          phase: Math.random() * Math.PI * 2,
          driftSpeed: 0.15 + Math.random() * 0.2,
          pulseSpeed: 0.8 + Math.random() * 1.2,
          driftRadius: 0.3 + Math.random() * 0.5,
        })
      }

      // Dust particles
      const pCount = 35
      const pGeo = new THREE.BufferGeometry()
      const pPos = new Float32Array(pCount * 3)
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 5
        pPos[i * 3 + 1] = Math.random() * 4.5
        pPos[i * 3 + 2] = Math.random() * -5 + 2
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      const pMat = new THREE.PointsMaterial({
        color: 0xd8d0c0, size: 0.012, transparent: true, opacity: 0.2,
        sizeAttenuation: true, depthWrite: false,
      })
      scene.add(new THREE.Points(pGeo, pMat))

      // ═══ GLOBAL WIND STATE ═══
      // Wind gusts: periodic intensity changes
      let windStrength = 0
      let windTarget = 0
      let windTimer = 0

      // ═══ ANIMATION ═══
      clockRef.current.start()
      let stalkGrowth = 0, communalFade = 0, userSlipFade = 0, fireflyFade = 0, frameSyncCount = 0

      function animate() {
        frameRef.current = requestAnimationFrame(animate)
        const elapsed = clockRef.current.getElapsedTime()
        const dt = clockRef.current.getDelta()

        // Size sync
        if (frameSyncCount < 60) {
          frameSyncCount++
          const w = container.clientWidth, h = container.clientHeight
          if (w > 0 && h > 0) {
            camera.aspect = w / h; camera.updateProjectionMatrix()
            renderer.setSize(w, h)
          }
        }

        // ── Wind gusts ──
        windTimer -= dt
        if (windTimer <= 0) {
          windTarget = 0.3 + Math.random() * 0.7 // random gust strength
          windTimer = 2 + Math.random() * 4 // next gust in 2-6 seconds
        }
        windStrength += (windTarget - windStrength) * 0.02 // smooth interpolation
        // Between gusts, wind dies down
        windTarget *= 0.995

        // ── 1. Grow user stalk ──
        if (stalkGrowth < 1) {
          stalkGrowth = Math.min(stalkGrowth + 0.006, 1)
          userStalk.scale.y = 1 - Math.pow(1 - stalkGrowth, 3)
        }

        // ── 2. User slip reveal ──
        if (stalkGrowth > 0.8 && !userSlip.visible) userSlip.visible = true
        if (userSlip.visible && userSlipFade < 1) {
          userSlipFade = Math.min(userSlipFade + 0.012, 1)
          const e = 1 - Math.pow(1 - userSlipFade, 2)
          userSlip.userData.slipMat.opacity = e * 0.97
          userSlip.userData.stringMat.opacity = e * 0.65
        }

        // ── 3. Communal slip fade ──
        if (communalFade < 1) {
          communalFade = Math.min(communalFade + 0.008, 1)
          allSlips.forEach(slip => {
            if (!slip.userData.isUser) {
              slip.userData.slipMat.opacity = communalFade * 0.85
              slip.userData.stringMat.opacity = communalFade * 0.45
            }
          })
        }

        // ── 4. Bamboo sway (wind-driven) ──
        allStalks.forEach(stalk => {
          const { swayPhase, swaySpeed, swayAmount } = stalk.userData
          const t = elapsed * swaySpeed + swayPhase
          const windSway = swayAmount * (1 + windStrength * 3)
          stalk.rotation.z += (Math.sin(t) * windSway - stalk.rotation.z) * 0.04
          stalk.rotation.x += (Math.sin(t * 1.3 + 0.7) * windSway * 0.3 - stalk.rotation.x) * 0.04
        })

        // ── 5. LEAF WIND SWAY ──
        allStalks.forEach(stalk => {
          const clusters = stalk.userData.leafClusters
          if (!clusters) return
          clusters.forEach(cluster => {
            cluster.children.forEach(leaf => {
              if (!leaf.userData.windPhase) return
              const { baseRotZ, baseRotX, windPhase, windSpeed, windAmount } = leaf.userData
              const t = elapsed * windSpeed + windPhase
              const w = windAmount * (1 + windStrength * 2.5)
              leaf.rotation.z = baseRotZ + Math.sin(t) * w
              leaf.rotation.x = baseRotX + Math.sin(t * 0.7 + 1.2) * w * 0.4
            })
          })
        })

        // ── 6. Paper sway (wind-driven) ──
        allSlips.forEach(slip => {
          const { swayPhase, swaySpeed } = slip.userData
          const t = elapsed * swaySpeed + swayPhase
          const paperWind = 0.035 * (1 + windStrength * 2)
          slip.rotation.z = Math.sin(t) * paperWind
          slip.rotation.y = Math.sin(t * 0.7) * paperWind * 0.5
        })

        // ── 7. Fireflies ──
        if (fireflyFade < 1) fireflyFade = Math.min(fireflyFade + 0.005, 1)
        fireflies.forEach(ff => {
          const t = elapsed * ff.driftSpeed + ff.phase
          const nx = ff.baseX + Math.sin(t) * ff.driftRadius
          const ny = ff.baseY + Math.sin(t * 0.7 + 1) * ff.driftRadius * 0.6
          const nz = ff.baseZ + Math.cos(t * 0.5 + 2) * ff.driftRadius * 0.4
          ff.light.position.set(nx, ny, nz)
          ff.dot.position.set(nx, ny, nz)
          const pulse = Math.pow(Math.max(0, Math.sin(elapsed * ff.pulseSpeed + ff.phase)), 3)
          ff.light.intensity = pulse * 0.6 * fireflyFade
          ff.dotMat.opacity = pulse * 0.8 * fireflyFade
        })

        // ── 8. Lantern + dappled ──
        userLantern.intensity = 0.8 + Math.sin(elapsed * 0.4) * 0.15
        dappled.position.x = Math.sin(elapsed * 0.07) * 1.2

        // ── 9. Particles ──
        const posArr = pGeo.attributes.position.array
        for (let i = 0; i < pCount; i++) {
          posArr[i * 3 + 1] += 0.0008
          posArr[i * 3] += Math.sin(elapsed * 0.12 + i * 0.4) * 0.0002
          if (posArr[i * 3 + 1] > 5) {
            posArr[i * 3 + 1] = -0.3
            posArr[i * 3] = (Math.random() - 0.5) * 5
            posArr[i * 3 + 2] = Math.random() * -5 + 2
          }
        }
        pGeo.attributes.position.needsUpdate = true

        // ── 10. FLY AWAY ANIMATION ──
        const fa = flyAwayRef.current
        if (fa && fa.active && !fa.completed) {
          const flyElapsed = elapsed - fa.startTime
          const duration = 3.5
          const t = Math.min(flyElapsed / duration, 1)

          if (fa.mode === 'print') {
            // ═══ PRINT MODE: Paper folds inward, glows amber, descends ═══
            // "Becoming physical" — pulled down into the real world
            const eased = t * t // ease-in (accelerates downward)

            // Warm amber glow intensifies then fades
            const glowPeak = Math.sin(t * Math.PI) // peaks at 50%
            fa.slip.userData.slipMat.emissive = new THREE.Color(0xFFB300)
            fa.slip.userData.slipMat.emissiveIntensity = glowPeak * 0.6

            // Descend + slight forward pull (toward camera)
            fa.slip.position.y = fa.baseY - eased * 1.8
            fa.slip.position.z = fa.baseZ + eased * 0.6

            // Fold/curl inward — rotate on X axis like paper folding
            fa.slip.rotation.x = eased * Math.PI * 0.4
            // Slight Z tilt
            fa.slip.rotation.z = Math.sin(flyElapsed * 2) * 0.05 * (1 - eased)

            // Scale down — shrinking into a small keepsake
            const scale = 1 - eased * 0.6
            fa.slip.scale.set(scale, scale, 1)

            // Fade: stays visible longer, then drops quickly at end
            const fadeT = Math.max(0, (t - 0.5) * 2) // starts fading at 50%
            fa.slip.userData.slipMat.opacity = Math.max(0, 0.97 * (1 - fadeT * fadeT))
            fa.slip.userData.stringMat.opacity = Math.max(0, 0.65 * (1 - t * 3))

          } else {
            // ═══ RELEASE MODE: Paper detaches, floats up, scatters into particles ═══
            // "Letting go" — released into the wind
            const eased = 1 - Math.pow(1 - t, 2.5) // ease-out (gentle lift)

            // Drift upward and sway in the wind
            fa.slip.position.y = fa.baseY + eased * 3.0
            fa.slip.position.x = fa.baseX + Math.sin(flyElapsed * 1.2) * eased * 0.8
            fa.slip.position.z = fa.baseZ - eased * 0.5 // drift back into grove

            // Tumble — paper caught in wind
            fa.slip.rotation.z = eased * 1.2 + Math.sin(flyElapsed * 2.5) * 0.3
            fa.slip.rotation.x = Math.sin(flyElapsed * 1.8) * eased * 0.4
            fa.slip.rotation.y = eased * 0.6

            // Fade out gradually
            fa.slip.userData.slipMat.opacity = Math.max(0, 0.97 * (1 - eased))
            fa.slip.userData.stringMat.opacity = Math.max(0, 0.65 * (1 - t * 2.5))

            // Spawn dissolve particles at 40% through
            if (t > 0.4 && !fa.particles) {
              const sparkCount = 24
              const sparkGeo = new THREE.BufferGeometry()
              const sparkPos = new Float32Array(sparkCount * 3)
              const sparkVel = []
              for (let s = 0; s < sparkCount; s++) {
                sparkPos[s * 3]     = fa.slip.position.x + (Math.random() - 0.5) * 0.3
                sparkPos[s * 3 + 1] = fa.slip.position.y + (Math.random() - 0.5) * 0.3
                sparkPos[s * 3 + 2] = fa.slip.position.z + (Math.random() - 0.5) * 0.15
                sparkVel.push({
                  vx: (Math.random() - 0.5) * 0.015,
                  vy: 0.005 + Math.random() * 0.012,
                  vz: (Math.random() - 0.5) * 0.008,
                })
              }
              sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
              const sparkMat = new THREE.PointsMaterial({
                color: FF_WARM,
                size: 0.018,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true,
              })
              const sparkPoints = new THREE.Points(sparkGeo, sparkMat)
              scene.add(sparkPoints)
              fa.particles = { points: sparkPoints, geo: sparkGeo, mat: sparkMat, vel: sparkVel, count: sparkCount }
            }

            // Animate dissolve particles
            if (fa.particles) {
              const sp = fa.particles
              const posArr = sp.geo.attributes.position.array
              for (let s = 0; s < sp.count; s++) {
                posArr[s * 3]     += sp.vel[s].vx
                posArr[s * 3 + 1] += sp.vel[s].vy
                posArr[s * 3 + 2] += sp.vel[s].vz
                sp.vel[s].vy += 0.0001 // slight upward acceleration
              }
              sp.geo.attributes.position.needsUpdate = true
              // Fade particles after spawning
              const particleAge = (t - 0.4) / 0.6 // 0→1 over remaining duration
              sp.mat.opacity = Math.max(0, 0.8 * (1 - particleAge))
            }
          }

          // String snaps quickly in both modes
          if (t >= 1 && !fa.completed) {
            fa.completed = true
            // Clean up dissolve particles if any
            if (fa.particles) {
              scene.remove(fa.particles.points)
              fa.particles.geo.dispose()
              fa.particles.mat.dispose()
            }
            if (onFlyAwayComplete) onFlyAwayComplete()
          }
        }

        // ── 11. Camera breathing ──
        camera.position.y = 1.6 + Math.sin(elapsed * 0.12) * 0.025

        renderer.render(scene, camera)
      }

      animate()

      // Resize
      const handleResize = () => {
        const w = container.clientWidth, h = container.clientHeight
        if (w > 0 && h > 0) {
          camera.aspect = w / h; camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
      }
      window.addEventListener('resize', handleResize)

      // Cleanup
      const cleanup = () => {
        window.removeEventListener('resize', handleResize)
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
        if (videoRef.current?.parentNode) { videoRef.current.srcObject = null; videoRef.current.parentNode.removeChild(videoRef.current) }
        if (rendererRef.current) {
          rendererRef.current.dispose()
          if (rendererRef.current.domElement?.parentNode) rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement)
        }
        scene.traverse(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) { if (child.material.map) child.material.map.dispose(); child.material.dispose() }
        })
      }
      cleanupRef.current = cleanup
      return cleanup
    }

    initTimeout = setTimeout(initScene, 350)

    return () => {
      clearTimeout(initTimeout)
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null }
      else {
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
        if (videoRef.current?.parentNode) { videoRef.current.srcObject = null; videoRef.current.parentNode.removeChild(videoRef.current) }
        if (rendererRef.current) {
          rendererRef.current.dispose()
          if (rendererRef.current.domElement?.parentNode) rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement)
        }
      }
    }
  }, [haiku, groveHaikus, createBambooStalk, createHangingSlip, onFlyAwayComplete])

  return (
    <div ref={containerRef} className="tanzaku-ar-container"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}
    />
  )
})

export default TanzakuARScene
