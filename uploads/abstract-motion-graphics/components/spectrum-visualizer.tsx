"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"

type Mode = "auto" | "file" | "mic"

// Neon palette sampled from the reference image (purple -> magenta -> blue/cyan)
const PALETTE: Array<[number, number, number]> = [
  [192, 132, 252], // light purple
  [168, 85, 247], // purple
  [217, 70, 239], // magenta
  [129, 140, 248], // indigo
  [56, 189, 248], // sky
  [34, 211, 238], // cyan
]

function lerpColor(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(0.9999, t))
  const scaled = clamped * (PALETTE.length - 1)
  const i = Math.floor(scaled)
  const f = scaled - i
  const a = PALETTE[i]
  const b = PALETTE[i + 1]
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ]
}

type Particle = {
  angle: number // angular position around the ring
  ringIndex: number // which concentric ring (0 = innermost, on the neon ring)
  depth: number // 0 = on the ring, 1 = far end of the streamer
  sideWeight: number // how far this streamer fans out (max on the horizontal sides)
  size: number
  bin: number // frequency bin this particle reacts to
  twinkle: number
}

export function SpectrumVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const timeRef = useRef<number>(0)

  // audio
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const freqDataRef = useRef<Uint8Array | null>(null)
  const sourceRef = useRef<AudioNode | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

  const [mode, setMode] = useState<Mode>("auto")
  const [trackName, setTrackName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Build a structured polar grid: concentric rings of evenly spaced dots that
  // get warped into silky horizontal wings on the left/right sides.
  const buildParticles = useCallback(() => {
    const particles: Particle[] = []
    const RINGS = 26 // concentric rings stacking outward
    const DOTS_PER_RING = 200 // evenly spaced dots around each ring

    for (let r = 0; r < RINGS; r++) {
      const depth = r / (RINGS - 1) // 0..1 outward
      for (let s = 0; s < DOTS_PER_RING; s++) {
        const angle = (s / DOTS_PER_RING) * Math.PI * 2
        // fan only on the horizontal sides: |cos| high near left/right, ~0 at top/bottom
        const sideWeight = Math.pow(Math.abs(Math.cos(angle)), 2.0)

        // dots only persist outward where the wing is wide
        const survival = sideWeight * (1 - depth * 0.6)
        if (r > 0 && Math.random() > survival) continue

        particles.push({
          angle,
          ringIndex: r,
          depth,
          sideWeight,
          size: r === 0 ? 1.1 : 0.9,
          bin: Math.floor((Math.abs(Math.cos(angle)) * 40 + r * 2) % 64),
          twinkle: Math.random() * Math.PI * 2,
        })
      }
    }

    particlesRef.current = particles
  }, [])

  const stopAudio = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause()
      audioElRef.current.src = ""
      audioElRef.current = null
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop())
      micStreamRef.current = null
    }
    sourceRef.current = null
  }, [])

  const ensureAnalyser = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtxRef.current = new Ctx()
    }
    if (!analyserRef.current && audioCtxRef.current) {
      const analyser = audioCtxRef.current.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82
      analyserRef.current = analyser
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
    return audioCtxRef.current!
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      const ctx = ensureAnalyser()
      await ctx.resume()
      stopAudio()

      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.crossOrigin = "anonymous"
      audio.loop = true
      audioElRef.current = audio

      const src = ctx.createMediaElementSource(audio)
      src.connect(analyserRef.current!)
      analyserRef.current!.connect(ctx.destination)
      sourceRef.current = src

      await audio.play()
      setMode("file")
      setTrackName(file.name)
    },
    [ensureAnalyser, stopAudio],
  )

  const handleMic = useCallback(async () => {
    const ctx = ensureAnalyser()
    await ctx.resume()
    stopAudio()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      const src = ctx.createMediaStreamSource(stream)
      src.connect(analyserRef.current!)
      sourceRef.current = src
      setMode("mic")
      setTrackName("")
    } catch {
      setMode("auto")
    }
  }, [ensureAnalyser, stopAudio])

  const goAuto = useCallback(() => {
    stopAudio()
    setMode("auto")
    setTrackName("")
  }, [stopAudio])

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void handleFile(file)
    },
    [handleFile],
  )

  // Main render loop
  useEffect(() => {
    buildParticles()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
    }
    resize()
    window.addEventListener("resize", resize)

    const render = () => {
      timeRef.current += 0.016
      const t = timeRef.current

      // pull audio data
      let bands: Uint8Array | null = null
      let energy = 0
      if (analyserRef.current && freqDataRef.current && (mode === "file" || mode === "mic")) {
        analyserRef.current.getByteFrequencyData(freqDataRef.current as Uint8Array<ArrayBuffer>)
        bands = freqDataRef.current
        for (let i = 0; i < bands.length; i++) energy += bands[i]
        energy = energy / bands.length / 255 // 0..1
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // hard clear keeps the dots crisp like the reference (no smear)
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2
      const ringRadius = Math.min(width, height) * 0.26

      ctx.globalCompositeOperation = "lighter"

      // soft colored glow behind the wings (purple upper-left, blue lower-right)
      const glow1 = ctx.createRadialGradient(
        cx - ringRadius * 1.4,
        cy - ringRadius * 0.6,
        0,
        cx - ringRadius * 1.4,
        cy - ringRadius * 0.6,
        ringRadius * 2.2,
      )
      const gAlpha = bands ? 0.1 + energy * 0.18 : 0.12 + Math.sin(t * 0.8) * 0.03
      glow1.addColorStop(0, `rgba(168,85,247,${gAlpha})`)
      glow1.addColorStop(1, "rgba(168,85,247,0)")
      ctx.fillStyle = glow1
      ctx.fillRect(0, 0, width, height)

      const glow2 = ctx.createRadialGradient(
        cx + ringRadius * 1.4,
        cy + ringRadius * 0.7,
        0,
        cx + ringRadius * 1.4,
        cy + ringRadius * 0.7,
        ringRadius * 2.2,
      )
      glow2.addColorStop(0, `rgba(56,189,248,${gAlpha})`)
      glow2.addColorStop(1, "rgba(56,189,248,0)")
      ctx.fillStyle = glow2
      ctx.fillRect(0, 0, width, height)

      const baseRot = t * 0.05
      const particles = particlesRef.current
      const ringGap = ringRadius * 0.05 // even spacing between concentric rings
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // audio amplitude (or auto decorative pulse) for this particle
        let amp: number
        if (bands) {
          amp = bands[p.bin % bands.length] / 255
        } else {
          amp = 0.45 + 0.4 * Math.sin(t * 1.6 + p.depth * 4 + p.angle * 3)
          amp = Math.max(0, amp)
        }

        // base outward distance: even concentric spacing, stretched on the sides
        const reactive = bands ? 1 + energy * 1.2 : 1 + amp * 0.35
        const sideStretch = 1 + p.sideWeight * 3.0 * reactive
        const radius = ringRadius + p.ringIndex * ringGap * sideStretch

        // silky warp: smooth sine wave travelling outward, strongest on the wings
        const wave = Math.sin(p.depth * 5 - t * 1.6 + p.angle * 2) * 0.12 * p.sideWeight
        // gentle progressive twist so the strands curve like ribbons
        const angle = p.angle + baseRot + p.depth * 0.35 * p.sideWeight + wave

        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius

        // fade out toward the far tip of each strand
        const distFade = Math.pow(1 - p.depth, 0.7)
        const brightness = (p.ringIndex === 0 ? 1 : 0.85) * distFade * (0.45 + amp * 0.7)

        // color: blend palette by vertical position (purple top -> cyan bottom)
        const vertical = (y - cy) / (ringRadius * 3) + 0.5
        const [r, g, b] = lerpColor(vertical + Math.sin(t * 0.3) * 0.05)

        const twinkle = 0.85 + 0.15 * Math.sin(t * 3 + p.twinkle)
        const size = p.size * (1 + amp * (p.ringIndex === 0 ? 0.3 : 0.6)) * twinkle

        ctx.beginPath()
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, brightness)})`
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // bright crisp neon ring outline
      const ringPulse = 1 + (bands ? energy * 0.09 : Math.sin(t * 1.3) * 0.012 + 0.012)
      const grad = ctx.createLinearGradient(cx, cy - ringRadius, cx, cy + ringRadius)
      grad.addColorStop(0, "rgba(192,132,252,1)")
      grad.addColorStop(0.5, "rgba(217,70,239,0.9)")
      grad.addColorStop(1, "rgba(56,189,248,1)")

      // outer glow pass
      ctx.lineWidth = 5
      ctx.strokeStyle = grad
      ctx.shadowBlur = 28 + (bands ? energy * 45 : 14)
      ctx.shadowColor = "rgba(168,120,255,0.85)"
      ctx.beginPath()
      ctx.arc(cx, cy, ringRadius * ringPulse, 0, Math.PI * 2)
      ctx.stroke()

      // crisp inner stroke
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 6
      ctx.strokeStyle = "rgba(255,255,255,0.95)"
      ctx.beginPath()
      ctx.arc(cx, cy, ringRadius * ringPulse, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      ctx.globalCompositeOperation = "source-over"
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [buildParticles, mode])

  // cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio()
      if (audioCtxRef.current) void audioCtxRef.current.close()
    }
  }, [stopAudio])

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Audio spectrum visualizer" />

      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6">
        {trackName && (
          <p className="pointer-events-none max-w-[80%] truncate text-center text-xs text-white/60">{trackName}</p>
        )}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-md">
          <ControlButton active={mode === "auto"} onClick={goAuto}>
            خودکار
          </ControlButton>
          <ControlButton active={mode === "file"} onClick={() => fileInputRef.current?.click()}>
            آپلود موزیک
          </ControlButton>
          <ControlButton active={mode === "mic"} onClick={() => void handleMic()}>
            میکروفون
          </ControlButton>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={onFileChange} />
    </div>
  )
}

function ControlButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors [font-family:var(--font-vazirmatn)] ${
        active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  )
}
