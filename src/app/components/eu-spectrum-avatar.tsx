"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';

// Neon Spectrum — exact port of the attached design: flowing concentric dotted
// rings whose angle maps to a frequency bin, so the ring reacts per-frequency to
// the microphone. Transparent canvas, portrait centered, drag to resize/activate,
// mic auto-enabled on drag-down / tap. Reaction kept gentle.
const SPEED = 2.2;
const INTENSITY = 2.3;
const AUDIO_GAIN = 1.5;       // per-frequency swing strength
const SPEED_BOOST = 0.6;      // tempo lift with loudness
const BINS = 96;

export function EuAvatar({ palette, name, portrait, cornerSlot, onSwipeLeft, onSwipeRight, swipeCount, swipeIndex, fixed, display, hideName, speaking }: { palette?: 'purple' | 'cyan'; name?: string; portrait?: string; fixed?: boolean; display?: boolean; hideName?: boolean; speaking?: boolean; cornerSlot?: any; onSwipeLeft?: () => void; onSwipeRight?: () => void; swipeCount?: number; swipeIndex?: number } = {}) {
  const portraitSrc = portrait || 'src/assets/avatar-portrait.png';
  const assistantName = name || (typeof localStorage !== 'undefined' && localStorage.getItem('aw-eu-assistant-name')) || 'لادن لرستانی';
  const [active, setActive] = useState(true);   // size: big (drag down) vs small+higher (drag up)
  const [powered, setPowered] = useState(true); // on/off: colour + mic + spectrum
  const [micOn, setMicOn] = useState(false);
  const [availW, setAvailW] = useState(460);     // measured column width → uniform fit scale
  const rootRef = useRef(null);

  // crossfade portraits when the agent changes — preload first so there's no blank flash
  const [displaySrc, setDisplaySrc] = useState(portraitSrc);
  const [prevPortrait, setPrevPortrait] = useState(null);
  useEffect(() => {
    if (portraitSrc === displaySrc) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setPrevPortrait(displaySrc);
      setDisplaySrc(portraitSrc);
      setTimeout(() => { if (!cancelled) setPrevPortrait(null); }, 650);
    };
    img.src = portraitSrc;
    return () => { cancelled = true; };
  }, [portraitSrc, displaySrc]);

  const canvasRef = useRef(null);
  const womanRef = useRef(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const smoothRef = useRef(new Float32Array(BINS));
  const overallRef = useRef(0);
  const peakRef = useRef(0.05);
  const floorRef = useRef(0.02);

  const activeRef = useRef(true);
  const poweredRef = useRef(true);
  const draggingRef = useRef(false);
  const swipeStartRef = useRef(null);
  const swipeCbRef = useRef({ left: onSwipeLeft, right: onSwipeRight });
  swipeCbRef.current = { left: onSwipeLeft, right: onSwipeRight };
  const micRef = useRef(false);
  const speakingRef = useRef(false);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const micStreamRef = useRef(null);

  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { poweredRef.current = powered; }, [powered]);
  useEffect(() => { micRef.current = micOn; }, [micOn]);
  useEffect(() => { speakingRef.current = !!speaking; }, [speaking]);

  const W = 460;
  const H = Math.round((W * 296) / 361);
  const WOMAN = Math.round(Math.min(W, H) * 0.58);

  // Measure the available column width and derive a uniform fit scale, so the
  // whole avatar (canvas + portrait + labels) shrinks together with NO distortion
  // and the reserved layout height collapses to match.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const pw = (el.parentElement && el.parentElement.clientWidth) || el.clientWidth || W;
      if (pw) setAvailW(pw);
    };
    measure();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && el.parentElement) {
      ro = new ResizeObserver(measure);
      ro.observe(el.parentElement);
    }
    window.addEventListener('resize', measure);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  const fit = Math.min(1, Math.max(0.4, (availW - 12) / W));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      // Always render at the fixed logical W×H; the parent transform scales it
      // for the small state, so the spectrum stays aligned with the portrait
      // instead of being re-buffered from a scaled bounding rect (which broke it).
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = W;
      h = H;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const offsetAt = (a, L, t, unit) => {
      const v =
        Math.sin(5 * a + L * 0.34 + t) +
        0.62 * Math.sin(3 * a - L * 0.20 - t * 0.8 + 1.2) +
        0.40 * Math.sin(8 * a + L * 0.12 + t * 1.25 + 2.1) +
        0.30 * Math.sin(2 * a - L * 0.08 - t * 0.5);
      return (v / 2.32) * unit;
    };
    const colorFor = (nx, alpha, dark) => {
      if (palette === 'cyan') {
        // cyan → blue band (admin panel)
        const hue = 196 + nx * 26;
        const light = 60 - nx * 4;
        return `hsla(${hue}, 92%, ${light}%, ${alpha})`;
      }
      if (dark) {
        // cyan → purple band (previous dark palette)
        const hue = 300 - nx * 110;
        const light = 58 + nx * 6;
        return `hsla(${hue}, 92%, ${light}%, ${alpha})`;
      }
      // blue → purple band only
      const hue = 280 - nx * 55;
      const light = 56 + nx * 7;
      return `hsla(${hue}, 88%, ${light}%, ${alpha})`;
    };
    const binForAngle = (a) => {
      const na = a / (Math.PI * 2);
      const folded = na < 0.5 ? na * 2 : (1 - na) * 2;
      return Math.min(BINS - 1, Math.floor(folded * BINS));
    };
    const readAudio = () => {
      const smooth = smoothRef.current;
      if (!micRef.current || !analyserRef.current || !audioDataRef.current) {
        if (speakingRef.current) {
          // synthetic speech envelope — makes the spectrum "talk" without a mic
          const tt = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
          const env = 0.45 + 0.32 * (Math.sin(tt * 6.3) * 0.5 + 0.5) * (Math.sin(tt * 2.1) * 0.5 + 0.5) + 0.12 * Math.sin(tt * 11.7);
          const target = Math.max(0.18, Math.min(0.92, env));
          overallRef.current += (target - overallRef.current) * 0.16;
          for (let i = 0; i < BINS; i++) {
            const bandTarget = Math.abs(target * (0.45 + 0.55 * Math.sin(tt * 4.7 + i * 0.42)));
            smooth[i] += (bandTarget - smooth[i]) * 0.13;
          }
          return;
        }
        overallRef.current += (0 - overallRef.current) * 0.08;
        for (let i = 0; i < BINS; i++) smooth[i] += (0 - smooth[i]) * 0.1;
        return;
      }
      analyserRef.current.getByteFrequencyData(audioDataRef.current);
      const data = audioDataRef.current;
      // speech energy lives in the low bins — weight those
      let sum = 0;
      const usable = Math.min(BINS, data.length);
      for (let i = 0; i < usable; i++) {
        const v = data[i] / 255;
        smooth[i] += (v - smooth[i]) * 0.18;
        const w = i < usable * 0.5 ? 1.6 : 0.6; // emphasise low/mid
        sum += v * w;
      }
      const raw = sum / usable;
      // noise floor tracks the quiet baseline; signal is energy above it
      floorRef.current += (raw - floorRef.current) * (raw < floorRef.current ? 0.1 : 0.004);
      const signal = Math.max(0, raw - floorRef.current * 1.4);
      // auto-gain: track a slowly-decaying peak so quiet voices still fill the ring
      peakRef.current = Math.max(signal, peakRef.current * 0.99, 0.04);
      const norm = Math.min(1, signal / peakRef.current);
      overallRef.current += (norm - overallRef.current) * 0.12;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (!poweredRef.current) {
        overallRef.current = 0;
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      readAudio();
      const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
      const overall = overallRef.current;
      tRef.current += 0.016 * SPEED * (1 + overall * SPEED_BOOST);
      const t = tRef.current;

      const cx = w / 2, cy = h / 2;
      const size = Math.min(w, h);
      const micActive = micRef.current && !!analyserRef.current;
      const voice = micActive || speakingRef.current;
      // global swell — whole ring breathes with the voice (clearly visible)
      const swell = voice ? 1 + overall * 0.08 : 1;
      const baseR = size * 0.27 * swell;
      const dotR = Math.max(0.9, size * 0.0030) * (voice ? 1 + overall * 0.22 : 1);

      ctx.globalCompositeOperation = 'source-over';
      const RINGS = 26;
      const gap = size * 0.0048;
      const waveUnit = size * 0.0275 * INTENSITY * (voice ? 1 + overall * 0.2 : 1);
      const spanR = baseR + RINGS * gap + waveUnit;
      const N = 240;
      const smooth = smoothRef.current;

      for (let L = 0; L < RINGS; L++) {
        const ringFade = Math.pow(1 - L / RINGS, 1.25);
        const layerWeight = Math.pow(L / (RINGS - 1), 0.85);
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          const idle = offsetAt(a, L, t, waveUnit) * 0.62;
          const audio = voice
            ? smooth[binForAngle(a)] * waveUnit * AUDIO_GAIN
            : offsetAt(a, L, t, waveUnit) * 0.38;
          const r = baseR + L * gap + (idle + audio) * layerWeight;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          const nx = Math.min(1, Math.max(0, 0.5 + (x - cx) / (spanR * 1.7)));
          const alpha = (0.5 + (voice ? overall * 0.1 : 0)) * ringFade;
          if (alpha < 0.02) continue;
          ctx.beginPath();
          ctx.fillStyle = colorFor(nx, alpha, isDarkTheme);
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const enableMic = useCallback(async () => {
    if (micRef.current) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      await audioCtxRef.current.resume();
      if (!analyserRef.current) {
        const a = audioCtxRef.current.createAnalyser();
        a.fftSize = 256;
        a.smoothingTimeConstant = 0.7;
        analyserRef.current = a;
        audioDataRef.current = new Uint8Array(a.frequencyBinCount);
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const src = audioCtxRef.current.createMediaStreamSource(stream);
      src.connect(analyserRef.current);
      setMicOn(true);
    } catch (e) {
      setMicOn(false);
    }
  }, []);

  const disableMic = useCallback(() => {
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(tr => tr.stop()); micStreamRef.current = null; }
    setMicOn(false);
  }, []);

  useEffect(() => () => {
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach(tr => tr.stop());
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch (e) {} }
  }, []);

  // Auto-power on entering the panel (mount follows the user's nav click)
  useEffect(() => {
    const id = setTimeout(() => { void enableMic(); }, 250);
    return () => clearTimeout(id);
  }, [enableMic]);

  // Horizontal swipe to switch agents — native listeners on the root so they
  // don't fight framer-motion's vertical (resize) drag on the inner element.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let sx = 0, sy = 0, tracking = false;
    const start = (x: number, y: number) => { sx = x; sy = y; tracking = true; };
    const end = (x: number, y: number) => {
      if (!tracking) return; tracking = false;
      const dx = x - sx, dy = y - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx < 0) swipeCbRef.current.left && swipeCbRef.current.left();
        else swipeCbRef.current.right && swipeCbRef.current.right();
      }
    };
    const ts = (e: TouchEvent) => { const t = e.touches[0]; start(t.clientX, t.clientY); };
    const te = (e: TouchEvent) => { const t = e.changedTouches[0]; end(t.clientX, t.clientY); };
    const pd = (e: PointerEvent) => { if (e.pointerType === 'mouse') start(e.clientX, e.clientY); };
    const pu = (e: PointerEvent) => { if (e.pointerType === 'mouse') end(e.clientX, e.clientY); };
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchend', te, { passive: true });
    el.addEventListener('pointerdown', pd);
    el.addEventListener('pointerup', pu);
    return () => {
      el.removeEventListener('touchstart', ts);
      el.removeEventListener('touchend', te);
      el.removeEventListener('pointerdown', pd);
      el.removeEventListener('pointerup', pu);
    };
  }, []);

  return (
    <div ref={rootRef} className="md:hidden relative overflow-visible" style={{ width: '100%', height: Math.round((active ? H : H / 3) * fit), marginTop: active ? -28 : -8, transition: 'height 0.45s cubic-bezier(0.4,0,0.2,1), margin-top 0.45s cubic-bezier(0.4,0,0.2,1)' }}>
    <div className="relative flex items-center justify-center overflow-visible" style={{ width: '100%', height: active ? H : Math.round(H / 3), transform: `scale(${fit})`, transformOrigin: 'top center', transition: 'height 0.45s cubic-bezier(0.4,0,0.2,1)' }}>
      <motion.div
        drag={fixed || display ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onPointerDown={() => { draggingRef.current = false; }}
        onDrag={() => { draggingRef.current = true; }}
        onDragEnd={(_e, info) => {
          if (fixed || display) return;
          // drag changes SIZE and couples power: small ⇒ off, big ⇒ on
          if (info.offset.y < -16) { setActive(false); setPowered(false); disableMic(); }
          else if (info.offset.y > 16) { setActive(true); setPowered(true); void enableMic(); }
        }}
        onTap={() => {
          if (display) return;
          // ignore the tap that fires at the end of a drag gesture
          if (draggingRef.current) { draggingRef.current = false; return; }
          // tap toggles on/off in ANY size
          if (poweredRef.current) { setPowered(false); disableMic(); }
          else { setPowered(true); void enableMic(); }
        }}
        className="touch-none relative flex items-center justify-center overflow-visible"
        style={{
          cursor: 'grab',
          flex: 'none',
          // Fixed logical size; the parent sizer applies a uniform scale to fit the
          // column, so the high-res canvas is cleanly downscaled and never squished.
          width: active ? W : Math.round(W / 3),
          height: active ? H : Math.round(H / 3),
          transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1), height 0.45s cubic-bezier(0.4,0,0.2,1)',
        }}
        title={powered ? 'برای خاموش کردن کلیک کنید' : 'برای روشن کردن کلیک کنید'}
      >
        {/* Animated neon spectrum (transparent high-res canvas, CSS-fit to container) — fades in when powered on */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', opacity: powered ? 1 : 0, transition: 'opacity 0.55s ease' }} />
        {/* Portrait — circular, sized as a fraction of the container so it tracks the spectrum at every size */}
        <div ref={womanRef} className="absolute rounded-full overflow-hidden" style={{
          height: '54%', aspectRatio: '1', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', transformOrigin: 'center',
          filter: powered ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.8)',
          transition: 'filter 0.5s ease',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.18)',
        }}>
          <img key={displaySrc} src={displaySrc} alt="آواتار" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center 22%' }} draggable={false} />
          {prevPortrait && (
            <img key={'prev-' + prevPortrait} src={prevPortrait} alt="" className="w-full h-full absolute inset-0 aw-avatar-out" style={{ objectFit: 'cover', objectPosition: 'center 22%', zIndex: 2 }} draggable={false} />
          )}
        </div>
      </motion.div>

      {/* Assistant human name — flanks the big avatar; sits on the dropdown row when small */}
      {!hideName && !display && (
      <div className="absolute pointer-events-none flex items-center gap-1.5"
        style={active
          ? { bottom: 30, left: '50%', transform: 'translateX(-50%) translateX(-110px)', color: 'var(--aw-text-primary)', transition: 'bottom 0.45s cubic-bezier(0.4,0,0.2,1)' }
          : { bottom: 2, left: '50%', transform: 'translateX(-50%) translateX(-110px)', color: 'var(--aw-text-primary)', transition: 'bottom 0.45s cubic-bezier(0.4,0,0.2,1)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: powered ? 'var(--aw-online, #00E676)' : 'var(--aw-offline, #8F8F8F)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>{assistantName}</span>
      </div>
      )}

      {/* Agent selector — flanks the big avatar; on the name's row when small */}
      {cornerSlot && (
        <div className="absolute" style={active
          ? { bottom: 26, left: '50%', transform: 'translateX(-50%) translateX(104px)', zIndex: 42, transition: 'bottom 0.45s cubic-bezier(0.4,0,0.2,1)' }
          : { bottom: 0, left: '50%', transform: 'translateX(-50%) translateX(104px)', zIndex: 42, transition: 'bottom 0.45s cubic-bezier(0.4,0,0.2,1)' }}>
          {cornerSlot}
        </div>
      )}

      {/* Drag hint — chevron + power caption; identical fixed position across all agents */}
      {!fixed && (
      <div
        className="absolute pointer-events-none flex flex-col items-center gap-0.5"
        style={{ bottom: 14, left: '50%', transform: 'translateX(-50%)', color: 'var(--aw-eu-primary, #7b62fc)', opacity: 0.85 }}
      >
        <i className={`fa-solid ${active ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: 12, lineHeight: 1 }} />
      </div>
      )}

      {/* Multi-agent swipe indicator — dots show when this team has more than one agent */}
      {swipeCount && swipeCount > 1 && (
        <div className="absolute pointer-events-none flex items-center gap-1.5" style={{ bottom: active ? 0 : -10, left: '50%', transform: 'translateX(-50%)' }}>
          {Array.from({ length: swipeCount }).map((_, i) => (
            <span key={i} className="rounded-full" style={{ width: i === swipeIndex ? 7 : 5, height: i === swipeIndex ? 7 : 5, background: i === swipeIndex ? 'var(--aw-eu-primary, #22A6F0)' : 'var(--aw-text-muted, #9aa)', opacity: i === swipeIndex ? 1 : 0.5, transition: 'all .2s' }} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
