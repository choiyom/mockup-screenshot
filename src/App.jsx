import { useState, useRef, useCallback, useEffect } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import {
  Upload, Download, Monitor, Smartphone, Square, Sun, Layers, Move,
  X, Loader2, ImagePlus, PackageCheck, Trash2, Type, AlignCenter,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DEVICES
   ═══════════════════════════════════════════════════════════════ */
const DEVICES = [
  { id: 'iphone16-pro-max', name: 'iPhone 16 Pro Max', icon: Smartphone, screenW: 440, screenH: 956, frameWidth: 290, frameRadius: 44, bezel: 8, type: 'iphone' },
  { id: 'iphone16-pro', name: 'iPhone 16 Pro', icon: Smartphone, screenW: 402, screenH: 874, frameWidth: 280, frameRadius: 42, bezel: 8, type: 'iphone' },
  { id: 'iphone16', name: 'iPhone 16', icon: Smartphone, screenW: 393, screenH: 852, frameWidth: 272, frameRadius: 42, bezel: 8, type: 'iphone' },
  { id: 'galaxy-s25-ultra', name: 'Galaxy S25 Ultra', icon: Smartphone, screenW: 412, screenH: 892, frameWidth: 258, frameRadius: 36, bezel: 7, type: 'samsung' },
  { id: 'galaxy-s25-plus', name: 'Galaxy S25+', icon: Smartphone, screenW: 412, screenH: 883, frameWidth: 252, frameRadius: 34, bezel: 7, type: 'samsung' },
  { id: 'galaxy-s25', name: 'Galaxy S25', icon: Smartphone, screenW: 360, screenH: 780, frameWidth: 242, frameRadius: 32, bezel: 7, type: 'samsung' },
  { id: 'browser-landscape', name: 'Browser (가로)', icon: Monitor, screenW: 1440, screenH: 900, frameWidth: 520, frameRadius: 12, bezel: 0, type: 'browser' },
  { id: 'browser-portrait', name: 'Browser (세로)', icon: Monitor, screenW: 768, screenH: 1024, frameWidth: 360, frameRadius: 12, bezel: 0, type: 'browser' },
  { id: 'glass-landscape', name: 'Glass (가로)', icon: Square, screenW: 16, screenH: 10, frameWidth: 460, frameRadius: 24, bezel: 0, type: 'glass' },
  { id: 'glass-portrait', name: 'Glass (세로)', icon: Square, screenW: 9, screenH: 16, frameWidth: 300, frameRadius: 24, bezel: 0, type: 'glass' },
]

const BACKGROUNDS = [
  { id: 'transparent', label: 'Transparent', value: 'transparent', isTransparent: true },
  { id: 'slate', label: 'Slate', value: '#1e293b' },
  { id: 'white', label: 'White', value: '#ffffff' },
  { id: 'zinc', label: 'Zinc', value: '#27272a' },
  { id: 'stone', label: 'Stone', value: '#f5f5f4' },
  { id: 'ocean', label: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'sunset', label: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'aurora', label: 'Aurora', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'mint', label: 'Mint', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'peach', label: 'Peach', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'night', label: 'Night', value: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)' },
  { id: 'candy', label: 'Candy', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
]

const SHADOWS = [
  { id: 'none', label: 'None', value: 'none' },
  { id: 'soft', label: 'Soft', value: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' },
  { id: 'medium', label: 'Medium', value: '0 20px 60px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.08)' },
  { id: 'high', label: 'High', value: '0 30px 80px rgba(0,0,0,0.30), 0 8px 24px rgba(0,0,0,0.14)' },
]

const checkerCSS = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23e5e7eb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e7eb'/%3E%3C/svg%3E")`

const FRAME_COLORS = [
  { id: 'light', label: 'Light', body: 'linear-gradient(170deg, #e0ddd8 0%, #c8c5c0 40%, #b0ada8 60%, #d2cfca 100%)', btn: 'linear-gradient(180deg, #c8c5c0, #aaa8a3)', island: '#000' },
  { id: 'dark', label: 'Dark', body: 'linear-gradient(170deg, #3a3a3c 0%, #2c2c2e 40%, #1c1c1e 60%, #3a3a3c 100%)', btn: 'linear-gradient(180deg, #4a4a4c, #2c2c2e)', island: '#000' },
  { id: 'gold', label: 'Gold', body: 'linear-gradient(170deg, #e8dcc8 0%, #d4c4a8 40%, #bfaf92 60%, #ddd0bc 100%)', btn: 'linear-gradient(180deg, #d4c4a8, #bfaf92)', island: '#000' },
  { id: 'blue', label: 'Blue', body: 'linear-gradient(170deg, #8eaec4 0%, #6a8fae 40%, #527a98 60%, #8eaec4 100%)', btn: 'linear-gradient(180deg, #8eaec4, #6a8fae)', island: '#000' },
]

/* ═══════════════════════════════════════════════════════════════
   IPHONE FRAME
   ═══════════════════════════════════════════════════════════════ */
function IPhoneFrame({ src, device, shadow, scale = 1, frameColor }) {
  const w = device.frameWidth * scale
  const r = device.frameRadius * scale
  const bezel = device.bezel * scale
  const fc = frameColor || FRAME_COLORS[0]

  return (
    <div style={{ position: 'relative', width: w }}>
      <div style={{ position: 'absolute', left: -2.5 * scale, top: 68 * scale, width: 2.5 * scale, height: 16 * scale, borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`, background: fc.btn }} />
      <div style={{ position: 'absolute', left: -2.5 * scale, top: 100 * scale, width: 2.5 * scale, height: 28 * scale, borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`, background: fc.btn }} />
      <div style={{ position: 'absolute', left: -2.5 * scale, top: 136 * scale, width: 2.5 * scale, height: 28 * scale, borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`, background: fc.btn }} />
      <div style={{ position: 'absolute', right: -2.5 * scale, top: 108 * scale, width: 2.5 * scale, height: 48 * scale, borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`, background: fc.btn }} />

      <div style={{
        width: w, borderRadius: r, padding: bezel, boxShadow: shadow,
        background: fc.body, position: 'relative', overflow: 'hidden',
      }}>
        {/* Outer bezel highlight */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: r, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.12)', pointerEvents: 'none', zIndex: 5 }} />
        {/* Screen — inset with visible gap from frame body */}
        <div style={{
          width: '100%', borderRadius: r - bezel, overflow: 'hidden', background: '#000', position: 'relative',
          boxShadow: `inset 0 0 0 ${0.5 * scale}px rgba(0,0,0,0.3)`,
        }}>
          <div style={{ position: 'absolute', top: 8 * scale, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <div style={{ background: fc.island, borderRadius: 999, width: 72 * scale, height: 22 * scale }} />
          </div>
          <img src={src} alt="" draggable={false} style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SAMSUNG FRAME
   ═══════════════════════════════════════════════════════════════ */
function SamsungFrame({ src, device, shadow, scale = 1, frameColor }) {
  const w = device.frameWidth * scale
  const r = device.frameRadius * scale
  const bezel = device.bezel * scale
  const fc = frameColor || FRAME_COLORS[1]
  return (
    <div style={{ position: 'relative', width: w }}>
      <div style={{ position: 'absolute', right: -2.5 * scale, top: 82 * scale, width: 2.5 * scale, height: 36 * scale, borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`, background: fc.btn }} />
      <div style={{ position: 'absolute', right: -2.5 * scale, top: 128 * scale, width: 2.5 * scale, height: 24 * scale, borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`, background: fc.btn }} />
      <div style={{ position: 'absolute', right: -2.5 * scale, top: 158 * scale, width: 2.5 * scale, height: 24 * scale, borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`, background: fc.btn }} />

      <div style={{
        width: w, borderRadius: r, padding: bezel, boxShadow: shadow,
        background: fc.body, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: r, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{
          width: '100%', borderRadius: r - bezel, overflow: 'hidden', background: '#000', position: 'relative',
          boxShadow: `inset 0 0 0 ${0.5 * scale}px rgba(0,0,0,0.3)`,
        }}>
          <div style={{ position: 'absolute', top: 10 * scale, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <div style={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', background: '#0a0a0a', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.08)' }} />
          </div>
          <img src={src} alt="" draggable={false} style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BROWSER FRAME
   ═══════════════════════════════════════════════════════════════ */
function BrowserFrame({ src, device, shadow, scale = 1 }) {
  const w = device.frameWidth * scale
  const r = device.frameRadius * scale
  return (
    <div style={{ width: w, borderRadius: r, overflow: 'hidden', background: '#fff', boxShadow: shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale, padding: `${8 * scale}px ${14 * scale}px`, background: '#f8f8f8', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: 5 * scale }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, margin: `0 ${10 * scale}px` }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 5 * scale, height: 24 * scale, display: 'flex', alignItems: 'center', padding: `0 ${10 * scale}px` }}>
            <div style={{ width: 8 * scale, height: 8 * scale, borderRadius: '50%', background: '#d1d5db', marginRight: 6 * scale }} />
            <span style={{ fontSize: 9 * scale, color: '#9ca3af' }}>https://example.com</span>
          </div>
        </div>
      </div>
      <img src={src} alt="" draggable={false} style={{ width: '100%', display: 'block' }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   GLASS FRAME
   ═══════════════════════════════════════════════════════════════ */
function GlassFrame({ src, device, shadow, scale = 1 }) {
  const w = device.frameWidth * scale
  const r = device.frameRadius * scale
  return (
    <div style={{ width: w, borderRadius: r, overflow: 'hidden', boxShadow: shadow, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(2px)', padding: 5 * scale, border: '1px solid rgba(255,255,255,0.2)' }}>
      <img src={src} alt="" draggable={false} style={{ width: '100%', display: 'block', borderRadius: r - 5 * scale }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DEVICE FRAME ROUTER
   ═══════════════════════════════════════════════════════════════ */
function DeviceFrame({ src, device, shadow, scale = 1, frameColor }) {
  const p = { src, device, shadow, scale, frameColor }
  switch (device.type) {
    case 'iphone': return <IPhoneFrame {...p} />
    case 'samsung': return <SamsungFrame {...p} />
    case 'browser': return <BrowserFrame {...p} />
    case 'glass': return <GlassFrame {...p} />
    default: return null
  }
}

/* ═══════════════════════════════════════════════════════════════
   SIMPLE MOCKUP CARD  (Tab 1)
   ═══════════════════════════════════════════════════════════════ */
function SimpleMockupCard({ src, device, bg, padding, shadow, cardRef, scale = 1, frameColor }) {
  const bgStyle = bg.isTransparent ? { background: 'transparent' } : bg.value.includes('gradient') ? { background: bg.value } : { backgroundColor: bg.value }
  return (
    <div ref={cardRef} style={{ ...bgStyle, padding: padding * scale, borderRadius: 16 * scale, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <DeviceFrame src={src} device={device} shadow={shadow.value} scale={scale} frameColor={frameColor} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   APP STORE MOCKUP CARD  (Tab 2) — 9:19.5 fixed canvas
   ═══════════════════════════════════════════════════════════════ */
function AppStoreMockupCard({ src, device, bgColor, title, subtitle, shadow, cardRef, scale = 1, frameColor, textColor: customTextColor, titleSize = 18, subSize = 11, textTop = 22 }) {
  const canvasW = 360 * scale
  const canvasH = canvasW * (2240 / 1260)
  const autoTextColor = isLightColor(bgColor) ? '#111' : '#fff'
  const textColor = customTextColor || autoTextColor
  const subColor = isLightColor(bgColor) ? '#555' : 'rgba(255,255,255,0.7)'
  const deviceScale = scale * (canvasW * 0.78) / device.frameWidth

  return (
    <div
      ref={cardRef}
      style={{
        width: canvasW,
        height: canvasH,
        background: bgColor,
        borderRadius: 16 * scale,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Text area */}
      <div style={{
        flex: `0 0 ${textTop}%`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${16 * scale}px ${22 * scale}px ${4 * scale}px`,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: titleSize * scale,
          fontWeight: 800,
          color: textColor,
          lineHeight: 1.3,
          margin: 0,
          wordBreak: 'keep-all',
          letterSpacing: '-0.02em',
        }}>
          {title || '대제목을 입력하세요'}
        </h2>
        <p style={{
          fontSize: subSize * scale,
          fontWeight: 500,
          color: subColor,
          lineHeight: 1.55,
          marginTop: 6 * scale,
          whiteSpace: 'pre-line',
          wordBreak: 'keep-all',
        }}>
          {subtitle || '소제목을 입력하세요'}
        </p>
      </div>

      {/* Device area — bottom 78%, fully visible, no clipping */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <DeviceFrame src={src} device={device} shadow={shadow.value} scale={deviceScale} frameColor={frameColor} />
      </div>
    </div>
  )
}

function isLightColor(hex) {
  if (!hex || hex === 'transparent') return true
  const c = hex.replace('#', '')
  if (c.length < 6) return true
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 140
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState('simple') // 'simple' | 'appstore'
  const [images, setImages] = useState([])
  const [device, setDevice] = useState(DEVICES[0])
  const [bg, setBg] = useState(BACKGROUNDS[5])
  const [padding, setPadding] = useState(64)
  const [shadow, setShadow] = useState(SHADOWS[2])
  const [isDragging, setIsDragging] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0])

  // App Store tab state
  const [asTitle, setAsTitle] = useState('')
  const [asSubtitle, setAsSubtitle] = useState('')
  const [asBgColor, setAsBgColor] = useState('#f0edf6')
  const [asTextColor, setAsTextColor] = useState('')  // empty = auto
  const [asTitleSize, setAsTitleSize] = useState(18)   // px at scale=1
  const [asSubSize, setAsSubSize] = useState(11)
  const [asTextTop, setAsTextTop] = useState(22)       // text area % from top

  const fileInputRef = useRef(null)
  const cardRefs = useRef({})

  /* ── File handling ─────────────────────────────────────────── */
  const handleFiles = useCallback((files) => {
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          src: e.target.result,
          name: file.name.replace(/\.[^.]+$/, ''),
        }])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files) }, [handleFiles])
  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true) }, [])
  const onDragLeave = useCallback(() => setIsDragging(false), [])
  const onFileChange = useCallback((e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = '' }, [handleFiles])
  const removeImage = useCallback((id) => setImages(prev => prev.filter(img => img.id !== id)), [])
  const clearAll = useCallback(() => setImages([]), [])

  // Clipboard paste support (Ctrl+V / Cmd+V)
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files = []
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
      if (files.length > 0) handleFiles(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFiles])

  /* ── Export single ─────────────────────────────────────────── */
  const exportSingle = useCallback(async (id) => {
    const el = cardRefs.current[id]
    if (!el) return
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: bg.isTransparent && tab === 'simple' ? null : undefined })
      const link = document.createElement('a')
      link.download = `mockup-${images.find(i => i.id === id)?.name || id}.png`
      link.href = dataUrl
      link.click()
    } catch (err) { console.error('Export failed:', err) }
  }, [bg, images, tab])

  /* ── Export ALL as ZIP ─────────────────────────────────────── */
  const exportAllZip = useCallback(async () => {
    if (images.length === 0) return
    setExporting(true); setExportProgress(0)
    try {
      const zip = new JSZip()
      for (let i = 0; i < images.length; i++) {
        const el = cardRefs.current[images[i].id]
        if (!el) continue
        const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: bg.isTransparent && tab === 'simple' ? null : undefined })
        zip.file(`mockup-${images[i].name || i + 1}.png`, dataUrl.split(',')[1], { base64: true })
        setExportProgress(Math.round(((i + 1) / images.length) * 100))
      }
      saveAs(await zip.generateAsync({ type: 'blob' }), `mockups_${new Date().getFullYear()}.zip`)
    } catch (err) { console.error('ZIP export failed:', err) }
    finally { setExporting(false); setExportProgress(0) }
  }, [images, bg, tab])

  const previewBgHint = bg.isTransparent && tab === 'simple' ? { backgroundImage: checkerCSS, backgroundSize: '16px 16px' } : {}
  const thumbScale = tab === 'appstore' ? 0.5 : device.screenW > device.screenH ? 0.38 : device.type === 'browser' ? 0.44 : 0.42

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-[15px] font-bold text-gray-900">DeepXRLab</h1>
          {images.length > 0 && <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{images.length}장</span>}
        </div>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" />전체 삭제
            </button>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 text-[13px] text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
            <ImagePlus className="w-4 h-4" />이미지 추가
          </button>
          <button onClick={exportAllZip} disabled={images.length === 0 || exporting} className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {exporting ? <><Loader2 className="w-4 h-4 animate-spin" />{exportProgress}%</> : <><PackageCheck className="w-4 h-4" />Export All (ZIP)</>}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── MAIN PREVIEW ───────────────────────────────────── */}
        <main className="flex-1 overflow-auto p-6">
          {images.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileInputRef.current?.click()}
                className={`w-full max-w-2xl aspect-[16/9] rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-4 transition-all ${isDragging ? 'border-violet-500 bg-violet-50 scale-[1.01]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragging ? 'bg-violet-100' : 'bg-gray-100'}`}>
                  <Upload className={`w-7 h-7 ${isDragging ? 'text-violet-600' : 'text-gray-300'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-[14px] font-semibold ${isDragging ? 'text-violet-700' : 'text-gray-500'}`}>스크린샷을 드롭하세요</p>
                  <p className="text-[12px] text-gray-400 mt-1">여러 장 동시 업로드 가능</p>
                </div>
              </div>
            </div>
          ) : (
            <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className="min-h-full">
              <div className="grid gap-5" style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${
                  tab === 'appstore' ? '220px' : device.screenW > device.screenH ? '320px' : device.type === 'browser' ? '240px' : '180px'
                }, 1fr))`,
              }}>
                {images.map((img) => (
                  <div key={img.id} className="group relative flex flex-col items-center">
                    {/* Hidden full-res export target */}
                    <div style={{ position: 'absolute', left: -99999, top: 0, opacity: 0, pointerEvents: 'none' }}>
                      {tab === 'simple' ? (
                        <SimpleMockupCard src={img.src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} cardRef={el => { cardRefs.current[img.id] = el }} scale={1} />
                      ) : (
                        <AppStoreMockupCard src={img.src} device={device} bgColor={asBgColor} title={asTitle} subtitle={asSubtitle} shadow={shadow} frameColor={frameColor} textColor={asTextColor} titleSize={asTitleSize} subSize={asSubSize} textTop={asTextTop} cardRef={el => { cardRefs.current[img.id] = el }} scale={1} />
                      )}
                    </div>

                    {/* Visible thumb */}
                    <div className="rounded-xl overflow-hidden w-full flex items-center justify-center p-2" style={{ ...previewBgHint, minHeight: 140 }}>
                      {tab === 'simple' ? (
                        <SimpleMockupCard src={img.src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} scale={thumbScale} />
                      ) : (
                        <AppStoreMockupCard src={img.src} device={device} bgColor={asBgColor} title={asTitle} subtitle={asSubtitle} shadow={shadow} frameColor={frameColor} textColor={asTextColor} titleSize={asTitleSize} subSize={asSubSize} textTop={asTextTop} scale={thumbScale} />
                      )}
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => exportSingle(img.id)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white" title="다운로드"><Download className="w-3.5 h-3.5 text-gray-600" /></button>
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50" title="삭제"><X className="w-3.5 h-3.5 text-gray-500" /></button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 truncate max-w-full px-2 font-medium">{img.name}</p>
                  </div>
                ))}

                <div onClick={() => fileInputRef.current?.click()} className="rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[160px] transition-colors hover:bg-gray-50">
                  <ImagePlus className="w-5 h-5 text-gray-300" /><span className="text-[11px] text-gray-400 font-medium">추가</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── SIDEBAR ────────────────────────────────────────── */}
        <aside className="w-[276px] bg-white border-l border-gray-100 overflow-y-auto shrink-0 flex flex-col">
          {/* Segmented Control */}
          <div className="p-4 pb-2">
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button onClick={() => setTab('simple')} className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${tab === 'simple' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                심플 디바이스
              </button>
              <button onClick={() => setTab('appstore')} className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${tab === 'appstore' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                앱스토어 양식
              </button>
            </div>
          </div>

          <div className="p-4 pt-2 flex flex-col gap-5 flex-1">
            {/* ── SHARED: Device Frame ──────────────────────── */}
            <Section title="디바이스 프레임" icon={Smartphone}>
              <div className="flex flex-col gap-3">
                <DeviceGroup label="iPhone" devices={DEVICES.filter(d => d.type === 'iphone')} current={device} onSelect={setDevice} />
                <DeviceGroup label="Galaxy" devices={DEVICES.filter(d => d.type === 'samsung')} current={device} onSelect={setDevice} tag="Android" />
                {tab === 'simple' && <>
                  <DeviceGroup label="Browser" devices={DEVICES.filter(d => d.type === 'browser')} current={device} onSelect={setDevice} />
                  <DeviceGroup label="Glass" devices={DEVICES.filter(d => d.type === 'glass')} current={device} onSelect={setDevice} />
                </>}
              </div>
            </Section>

            {/* ── SHARED: Frame Color (phone only) ──────────── */}
            {(device.type === 'iphone' || device.type === 'samsung') && (
              <Section title="프레임 컬러" icon={Sun}>
                <div className="flex gap-2">
                  {FRAME_COLORS.map(fc => (
                    <button key={fc.id} onClick={() => setFrameColor(fc)}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all ${frameColor.id === fc.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                      {fc.label}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* ── TAB 1: Simple ─────────────────────────────── */}
            {tab === 'simple' && (
              <>
                <Section title="배경" icon={Sun}>
                  <div className="grid grid-cols-4 gap-2">
                    {BACKGROUNDS.map(b => {
                      const isGrad = b.value.includes('gradient')
                      return (
                        <button key={b.id} onClick={() => setBg(b)} title={b.label}
                          className={`w-full aspect-square rounded-xl transition-all relative overflow-hidden ${bg.id === b.id ? 'ring-2 ring-gray-900 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                          style={b.isTransparent ? { backgroundImage: checkerCSS, backgroundSize: '8px 8px' } : isGrad ? { background: b.value } : { backgroundColor: b.value, border: (b.id === 'white' || b.id === 'stone') ? '1px solid #e5e7eb' : 'none' }}>
                          {b.isTransparent && <div className="absolute inset-0 flex items-center justify-center"><span className="text-[8px] font-bold text-gray-400">T</span></div>}
                        </button>
                      )
                    })}
                  </div>
                </Section>

                <Section title="여백" icon={Move}>
                  <div className="flex items-center gap-3">
                    <input type="range" min={20} max={140} value={padding} onChange={e => setPadding(Number(e.target.value))} className="flex-1 accent-gray-900 h-1.5" />
                    <span className="text-[11px] text-gray-500 font-mono w-10 text-right">{padding}px</span>
                  </div>
                </Section>
              </>
            )}

            {/* ── TAB 2: App Store ──────────────────────────── */}
            {tab === 'appstore' && (
              <>
                <Section title="배경 색상" icon={Sun}>
                  <div className="flex items-center gap-2">
                    <input type="color" value={asBgColor} onChange={e => setAsBgColor(e.target.value)} className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                    <input type="text" value={asBgColor} onChange={e => setAsBgColor(e.target.value)} className="flex-1 text-[12px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-300" />
                  </div>
                  {/* Quick presets */}
                  <div className="flex gap-1.5 mt-2">
                    {['#f0edf6', '#e8f4f8', '#fef3e2', '#f0f0f0', '#1a1a2e', '#0f172a'].map(c => (
                      <button key={c} onClick={() => setAsBgColor(c)} className={`w-7 h-7 rounded-lg border transition-all ${asBgColor === c ? 'ring-2 ring-gray-900 ring-offset-1 scale-110' : 'border-gray-200 hover:scale-105'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </Section>

                <Section title="글씨 색상" icon={Type}>
                  <div className="flex items-center gap-2">
                    <input type="color" value={asTextColor || (isLightColor(asBgColor) ? '#111111' : '#ffffff')} onChange={e => setAsTextColor(e.target.value)} className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                    <input type="text" value={asTextColor || 'Auto'} onChange={e => setAsTextColor(e.target.value)} placeholder="Auto" className="flex-1 text-[12px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-300" />
                    {asTextColor && <button onClick={() => setAsTextColor('')} className="text-[10px] text-gray-400 hover:text-gray-600 px-1">Auto</button>}
                  </div>
                </Section>

                <Section title="대제목" icon={Type}>
                  <input type="text" value={asTitle} onChange={e => setAsTitle(e.target.value)} placeholder="당신의 잊혀진 시간을 깨우다" className="w-full text-[13px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 font-semibold" />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400 w-8 shrink-0">크기</span>
                    <input type="range" min={10} max={36} value={asTitleSize} onChange={e => setAsTitleSize(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{asTitleSize}px</span>
                  </div>
                </Section>

                <Section title="소제목" icon={AlignCenter}>
                  <textarea value={asSubtitle} onChange={e => setAsSubtitle(e.target.value)} placeholder={"당신의 영혼에 새겨진\n전생의 기억을 되짚어냅니다."} rows={3} className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400 w-8 shrink-0">크기</span>
                    <input type="range" min={8} max={24} value={asSubSize} onChange={e => setAsSubSize(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{asSubSize}px</span>
                  </div>
                </Section>

                <Section title="텍스트 위치" icon={Move}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-8 shrink-0">높이</span>
                    <input type="range" min={12} max={40} value={asTextTop} onChange={e => setAsTextTop(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{asTextTop}%</span>
                  </div>
                </Section>
              </>
            )}

            {/* ── SHARED: Shadow ────────────────────────────── */}
            <Section title="그림자" icon={Layers}>
              <div className="grid grid-cols-2 gap-1.5">
                {SHADOWS.map(s => (
                  <button key={s.id} onClick={() => setShadow(s)} className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${shadow.id === s.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{s.label}</button>
                ))}
              </div>
            </Section>

            {images.length === 0 && (
              <div className="mt-auto p-4 bg-gray-50 rounded-xl">
                <p className="text-[11px] text-gray-400"><span className="font-semibold text-gray-600">Tip: </span>
                  {tab === 'simple' ? '스크린샷을 업로드하고 디바이스 프레임을 선택하세요.' : '스크린샷과 마케팅 텍스트를 입력해 앱스토어용 이미지를 만드세요.'}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Export overlay ────────────────────────────────────── */}
      {exporting && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[280px]">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            <p className="text-[14px] font-semibold text-gray-800">목업 생성 중...</p>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-violet-600 h-full rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
            </div>
            <p className="text-[12px] text-gray-400">{exportProgress}% 완료</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function DeviceGroup({ label, devices, current, onSelect, tag }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1 px-1">{label}</p>
      <div className="flex flex-col gap-1">
        {devices.map(d => (
          <button key={d.id} onClick={() => onSelect(d)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${current.id === d.id ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            <d.icon className="w-3.5 h-3.5" />
            {d.name}
            {tag && <span className="ml-auto text-[9px] opacity-50 font-normal">{tag}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
