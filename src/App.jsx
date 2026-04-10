import { useState, useRef, useCallback, useEffect } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import {
  Upload, Download, Monitor, Smartphone, Square, Sun, Layers, Move,
  X, Loader2, ImagePlus, PackageCheck, Trash2, Type, AlignCenter, Minimize2, Globe,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   i18n
   ═══════════════════════════════════════════════════════════════ */
const T = {
  en: {
    dropTitle: 'Drop your screenshots here',
    dropSub: 'Supports multiple images at once',
    addImages: 'Add Images',
    exportAll: 'Export All (ZIP)',
    clearAll: 'Clear all',
    deviceFrame: 'Device Frame',
    frameColor: 'Frame Color',
    background: 'Background',
    padding: 'Padding',
    shadow: 'Shadow',
    storeSize: 'Store Sizes',
    storeSizeHint: 'Checked sizes will be included in ZIP',
    bgColor: 'Background Color',
    textColor: 'Text Color',
    text: 'Text',
    globalApply: 'Apply All',
    individualApply: 'Individual',
    title: 'Title',
    titlePlaceholder: 'Enter title',
    subtitle: 'Subtitle',
    subtitlePlaceholder: 'Enter subtitle',
    editingImg: 'Editing',
    selectToEdit: 'Click an image to edit its text',
    textSize: 'Text Size',
    textPos: 'Text Position',
    height: 'Height',
    gap: 'Gap',
    size: 'Size',
    add: 'Add',
    collapse: 'Collapse',
    simpleDevice: 'Simple Device',
    storeScreenshot: 'Store Screenshot',
    tipSimple: 'Upload screenshots and pick a device frame.',
    tipStore: 'Add screenshots and marketing text to create store images.',
    generating: 'Generating mockups...',
    complete: 'complete',
    sponsored: 'Sponsored',
    adArea: 'Ad area',
    imgCount: (n) => `${n} image${n > 1 ? 's' : ''}`,
  },
  ko: {
    dropTitle: '스크린샷을 드롭하세요',
    dropSub: '여러 장 동시 업로드 가능',
    addImages: '{t.addImages}',
    exportAll: 'Export All (ZIP)',
    clearAll: '{t.clearAll}',
    deviceFrame: '디바이스 프레임',
    frameColor: '프레임 컬러',
    background: '배경',
    padding: '여백',
    shadow: '그림자',
    storeSize: '스토어 사이즈',
    storeSizeHint: '체크한 사이즈가 ZIP에 포함됩니다',
    bgColor: '배경 색상',
    textColor: '글씨 색상',
    text: '텍스트',
    globalApply: '전체 적용',
    individualApply: '개별 적용',
    title: '대제목',
    titlePlaceholder: '대제목을 입력하세요',
    subtitle: '소제목',
    subtitlePlaceholder: '소제목을 입력하세요',
    editingImg: '편집 중',
    selectToEdit: '이미지를 클릭하면 개별 텍스트를 편집할 수 있습니다',
    textSize: '텍스트 크기',
    textPos: '텍스트 위치',
    height: '높이',
    gap: '간격',
    size: '크기',
    add: '추가',
    collapse: '접기',
    simpleDevice: '심플 디바이스',
    storeScreenshot: '스토어 스크린샷',
    tipSimple: '스크린샷을 업로드하고 디바이스 프레임을 선택하세요.',
    tipStore: '스크린샷과 마케팅 텍스트를 입력해 스토어용 이미지를 만드세요.',
    generating: '목업 생성 중...',
    complete: '완료',
    sponsored: 'Sponsored',
    adArea: '광고 영역',
    imgCount: (n) => `${n}장`,
  },
  zh: {
    dropTitle: '拖放截图到这里',
    dropSub: '支持同时上传多张图片',
    addImages: '添加图片',
    exportAll: '导出全部 (ZIP)',
    clearAll: '全部清除',
    deviceFrame: '设备框架',
    frameColor: '框架颜色',
    background: '背景',
    padding: '间距',
    shadow: '阴影',
    storeSize: '商店尺寸',
    storeSizeHint: '勾选的尺寸将包含在ZIP中',
    bgColor: '背景颜色',
    textColor: '文字颜色',
    text: '文本',
    globalApply: '全部应用',
    individualApply: '单独应用',
    title: '大标题',
    titlePlaceholder: '请输入标题',
    subtitle: '副标题',
    subtitlePlaceholder: '请输入副标题',
    editingImg: '编辑中',
    selectToEdit: '点击图片编辑其文本',
    textSize: '文字大小',
    textPos: '文字位置',
    height: '高度',
    gap: '间距',
    size: '大小',
    add: '添加',
    collapse: '收起',
    simpleDevice: '简单设备',
    storeScreenshot: '商店截图',
    tipSimple: '上传截图并选择设备框架。',
    tipStore: '添加截图和营销文案来制作商店图片。',
    generating: '正在生成...',
    complete: '完成',
    sponsored: 'Sponsored',
    adArea: '广告区域',
    imgCount: (n) => `${n}张`,
  },
}

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
  // ── iPad ──────────────────────────────────────────────────
  { id: 'ipad-pro-13', name: 'iPad Pro 13"', icon: Monitor, screenW: 2048, screenH: 2732, frameWidth: 340, frameRadius: 24, bezel: 12, type: 'ipad' },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', icon: Monitor, screenW: 1668, screenH: 2388, frameWidth: 320, frameRadius: 22, bezel: 12, type: 'ipad' },
  // ── Android Tablet ───────────────────────────────────────
  { id: 'android-tab-10', name: 'Android Tablet 10"', icon: Monitor, screenW: 1920, screenH: 2560, frameWidth: 330, frameRadius: 20, bezel: 10, type: 'android-tab' },
  // ── Browser ────────────────────────────────────────────────
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

const FONT_OPTIONS = [
  { id: 'pretendard', label: 'Pretendard', family: '"Pretendard Variable", Pretendard, -apple-system, sans-serif' },
  { id: 'suit', label: 'SUIT', family: '"SUIT Variable", "SUIT", sans-serif' },
  { id: 'noto', label: 'Noto Sans KR', family: '"Noto Sans KR", sans-serif' },
]

/* ═══════════════════════════════════════════════════════════════
   STORE FORMAT PRESETS — export resolution + matching device
   ═══════════════════════════════════════════════════════════════ */
const STORE_PRESETS = [
  { id: 'appstore', label: 'App Store', formats: [
    { id: 'as-ip-6.7', label: 'iPhone 6.7"', w: 1290, h: 2796, deviceId: 'iphone16-pro-max' },
    { id: 'as-ip-6.5', label: 'iPhone 6.5"', w: 1242, h: 2688, deviceId: 'iphone16-pro-max' },
    { id: 'as-ip-6.1', label: 'iPhone 6.1"', w: 1284, h: 2778, deviceId: 'iphone16' },
    { id: 'as-ipad-12.9', label: 'iPad 12.9"', w: 2048, h: 2732, deviceId: 'ipad-pro-13' },
    { id: 'as-ipad-13', label: 'iPad 13"', w: 2064, h: 2752, deviceId: 'ipad-pro-13' },
  ]},
  { id: 'playstore', label: 'Play Store', formats: [
    { id: 'ps-phone-fhd', label: 'Phone FHD', w: 1080, h: 1920, deviceId: 'galaxy-s25-ultra' },
    { id: 'ps-phone-qhd', label: 'Phone QHD', w: 1440, h: 2560, deviceId: 'galaxy-s25-ultra' },
    { id: 'ps-phone-max', label: 'Phone Max', w: 2160, h: 3840, deviceId: 'galaxy-s25-ultra' },
    { id: 'ps-tab-7', label: 'Tablet 7"', w: 1800, h: 2560, deviceId: 'android-tab-10' },
    { id: 'ps-tab-10', label: 'Tablet 10"', w: 1920, h: 2560, deviceId: 'android-tab-10' },
  ]},
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
   IPAD FRAME
   ═══════════════════════════════════════════════════════════════ */
function IPadFrame({ src, device, shadow, scale = 1, frameColor }) {
  const w = device.frameWidth * scale
  const r = device.frameRadius * scale
  const bezel = device.bezel * scale
  const fc = frameColor || FRAME_COLORS[0]
  return (
    <div style={{
      width: w, borderRadius: r, padding: bezel, boxShadow: shadow,
      background: fc.body, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: r, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 5 }} />
      <div style={{
        width: '100%', borderRadius: r - bezel, overflow: 'hidden', background: '#000', position: 'relative',
        boxShadow: `inset 0 0 0 ${0.5 * scale}px rgba(0,0,0,0.2)`,
      }}>
        <img src={src} alt="" draggable={false} style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANDROID TABLET FRAME
   ═══════════════════════════════════════════════════════════════ */
function AndroidTabFrame({ src, device, shadow, scale = 1, frameColor }) {
  const w = device.frameWidth * scale
  const r = device.frameRadius * scale
  const bezel = device.bezel * scale
  const fc = frameColor || FRAME_COLORS[1]
  return (
    <div style={{
      width: w, borderRadius: r, padding: bezel, boxShadow: shadow,
      background: fc.body, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: r, boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.15), inset 0 -0.5px 0 rgba(0,0,0,0.15)', pointerEvents: 'none', zIndex: 5 }} />
      <div style={{
        width: '100%', borderRadius: r - bezel, overflow: 'hidden', background: '#000', position: 'relative',
        boxShadow: `inset 0 0 0 ${0.5 * scale}px rgba(0,0,0,0.2)`,
      }}>
        <img src={src} alt="" draggable={false} style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
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
    case 'ipad': return <IPadFrame {...p} />
    case 'android-tab': return <AndroidTabFrame {...p} />
    case 'browser': return <BrowserFrame {...p} />
    case 'glass': return <GlassFrame {...p} />
    default: return null
  }
}

/* ═══════════════════════════════════════════════════════════════
   3D DEVICE WRAPPER — adds depth/thickness to DeviceFrame
   ═══════════════════════════════════════════════════════════════ */
function Device3D({ src, device, shadow, scale = 1, frameColor, depth = 8 }) {
  const fc = frameColor || FRAME_COLORS[0]
  const d = depth * scale
  const w = device.frameWidth * scale
  const r = device.frameRadius * scale
  // Side color: darken the frame body color
  const sideColor = fc.id === 'dark' ? '#1a1a1a' : fc.id === 'gold' ? '#9a8060' : fc.id === 'blue' ? '#4a6e85' : '#b0b0b8'
  const sideDark = fc.id === 'dark' ? '#111' : fc.id === 'gold' ? '#806848' : fc.id === 'blue' ? '#3a5a70' : '#95959d'

  return (
    <div style={{ position: 'relative', transformStyle: 'preserve-3d', width: w }}>
      {/* Front face — the actual device */}
      <div style={{ transformStyle: 'preserve-3d', transform: `translateZ(${d / 2}px)` }}>
        <DeviceFrame src={src} device={device} shadow={shadow} scale={scale} frameColor={frameColor} />
      </div>
      {/* Right edge */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: d, height: '100%',
        transform: `rotateY(90deg) translateZ(0px)`,
        transformOrigin: 'right center',
        background: `linear-gradient(180deg, ${sideColor} 0%, ${sideDark} 100%)`,
        borderRadius: `0 ${Math.min(r * 0.15, 3)}px ${Math.min(r * 0.15, 3)}px 0`,
      }} />
      {/* Left edge */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: d, height: '100%',
        transform: `rotateY(-90deg) translateZ(0px)`,
        transformOrigin: 'left center',
        background: `linear-gradient(180deg, ${sideColor} 0%, ${sideDark} 100%)`,
        borderRadius: `${Math.min(r * 0.15, 3)}px 0 0 ${Math.min(r * 0.15, 3)}px`,
      }} />
      {/* Top edge */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: d,
        transform: `rotateX(90deg) translateZ(0px)`,
        transformOrigin: 'top center',
        background: sideColor,
        borderRadius: `${Math.min(r * 0.15, 3)}px ${Math.min(r * 0.15, 3)}px 0 0`,
      }} />
      {/* Bottom edge */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: d,
        transform: `rotateX(-90deg) translateZ(0px)`,
        transformOrigin: 'bottom center',
        background: sideDark,
        borderRadius: `0 0 ${Math.min(r * 0.15, 3)}px ${Math.min(r * 0.15, 3)}px`,
      }} />
      {/* Back face */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        transform: `translateZ(${-d / 2}px)`,
        background: sideDark,
        borderRadius: r,
      }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SIMPLE MOCKUP CARD  (Tab 1)
   ═══════════════════════════════════════════════════════════════ */
function SimpleMockupCard({ src, device, bg, padding, shadow, cardRef, scale = 1, frameColor }) {
  const bgStyle = bg.isTransparent ? { background: 'transparent' } : bg.value.includes('gradient') ? { background: bg.value } : { backgroundColor: bg.value }
  return (
    <div ref={cardRef} style={{ ...bgStyle, padding: padding * scale, borderRadius: 16 * scale, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
      <DeviceFrame src={src} device={device} shadow={shadow.value} scale={scale} frameColor={frameColor} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   APP STORE MOCKUP CARD  (Tab 2) — 9:19.5 fixed canvas
   ═══════════════════════════════════════════════════════════════ */
function AppStoreMockupCard({ src, device, bgColor, title, subtitle, shadow, cardRef, scale = 1, frameColor, textColor: customTextColor, titleSize = 18, subSize = 11, textTop = 22, gap = 0, exportW, exportH, fontFamily, subTextColor }) {
  const canvasW = exportW ? exportW * scale : 360 * scale
  const canvasH = exportH ? exportH * scale : canvasW * (2240 / 1260)
  const autoTextColor = isLightColor(bgColor) ? '#111' : '#fff'
  const textColor = customTextColor || autoTextColor
  const subColor = subTextColor || (isLightColor(bgColor) ? '#555' : 'rgba(255,255,255,0.7)')
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
          fontFamily: fontFamily || undefined,
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
          fontFamily: fontFamily || undefined,
        }}>
          {subtitle || '소제목을 입력하세요'}
        </p>
      </div>

      {/* Device area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginTop: gap * scale,
      }}>
        <DeviceFrame src={src} device={device} shadow={shadow.value} scale={deviceScale} frameColor={frameColor} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STORE GRAPHIC CARD  (Tab 3) — landscape/portrait canvas
   Flat overlapping layout with up to 4 devices
   ═══════════════════════════════════════════════════════════════ */
function StoreGraphicCard({ images, device, bgColor, title, subtitle, shadow, cardRef, scale = 1, frameColor, textColor: customTextColor, titleSize = 24, subSize = 14, orientation = 'landscape', fontFamily, graphicShadow = true, showText = true, textOffsetX = 0, textOffsetY = 0, subTextColor, slots = [] }) {
  const baseW = orientation === 'landscape' ? 4096 : 2000
  const baseH = orientation === 'landscape' ? 2000 : 4096
  const canvasW = (orientation === 'landscape' ? 820 : 400) * scale
  const canvasH = canvasW * (baseH / baseW)
  const isTransparentBg = bgColor === 'transparent'
  const autoTextColor = isTransparentBg || isLightColor(bgColor) ? '#111' : '#fff'
  const textColor = customTextColor || autoTextColor
  const subColor = subTextColor || (isTransparentBg || isLightColor(bgColor) ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)')
  const phoneSc = scale * (canvasH * 0.95) / (device.frameWidth * 2.2)
  const isLand = orientation === 'landscape'

  return (
    <div ref={cardRef} style={{
      width: canvasW, height: canvasH, background: isTransparentBg ? 'transparent' : bgColor,
      borderRadius: 12 * scale, overflow: 'hidden', position: 'relative',
    }}>
      {/* Text area — absolute positioned */}
      {showText && (
        <div style={{
          position: 'absolute',
          left: isLand ? `${(28 + textOffsetX) * scale}px` : '50%',
          top: isLand ? '50%' : `${(16 + textOffsetY) * scale}px`,
          transform: isLand ? `translateY(-50%)` : `translateX(-50%)`,
          zIndex: 10,
          textAlign: isLand ? 'left' : 'center',
          maxWidth: isLand ? '40%' : '80%',
        }}>
          <h2 style={{
            fontSize: titleSize * scale, fontWeight: 800, color: textColor,
            lineHeight: 1.25, margin: 0, wordBreak: 'keep-all', letterSpacing: '-0.02em',
            fontFamily: fontFamily || undefined,
          }}>{title || 'Your App Title'}</h2>
          <p style={{
            fontSize: subSize * scale, fontWeight: 500, color: subColor,
            lineHeight: 1.5, marginTop: 8 * scale, whiteSpace: 'pre-line', wordBreak: 'keep-all',
            fontFamily: fontFamily || undefined,
          }}>{subtitle || 'App description goes here'}</p>
        </div>
      )}

      {/* Device slots — flat overlapping */}
      {slots.map((slot, i) => {
        if (!slot.visible) return null
        const imgSrc = images[i]?.src || images[0]?.src
        if (!imgSrc) return null
        const sf = graphicShadow
          ? `drop-shadow(${4 * scale}px ${8 * scale}px ${24 * scale}px rgba(0,0,0,0.25))`
          : 'none'
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `calc(50% + ${slot.x * scale}px)`,
            top: `calc(50% + ${slot.y * scale}px)`,
            transform: `translate(-50%, -50%) rotate(${slot.rotate || 0}deg) scale(${slot.scale || 1})`,
            zIndex: slot.z || (i + 1),
            filter: sf,
          }}>
            <DeviceFrame src={imgSrc} device={device} shadow="none" scale={phoneSc} frameColor={frameColor} />
          </div>
        )
      })}
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
  const [lang, setLang] = useState('en')
  const t = T[lang]
  const [tab, setTab] = useState('simple') // 'simple' | 'appstore' | 'graphic'
  const [graphicOrientation, setGraphicOrientation] = useState('landscape') // 'landscape' | 'portrait'
  const [graphicTitleSize, setGraphicTitleSize] = useState(24)
  const [graphicSubSize, setGraphicSubSize] = useState(14)
  const [asFont, setAsFont] = useState(FONT_OPTIONS[0])
  const [graphicShadow, setGraphicShadow] = useState(true)
  const [graphicShowText, setGraphicShowText] = useState(true)
  const [graphicTransparentBg, setGraphicTransparentBg] = useState(false)
  const [grTextOffsetX, setGrTextOffsetX] = useState(0)
  const [grTextOffsetY, setGrTextOffsetY] = useState(0)
  // 4 device slots: { visible, x, y, rotate, z, scale }
  const defaultSlots = [
    { visible: true, x: 40, y: 20, rotate: -5, z: 2, scale: 1 },
    { visible: true, x: 140, y: -10, rotate: 3, z: 3, scale: 1 },
    { visible: false, x: -60, y: 30, rotate: -8, z: 1, scale: 0.95 },
    { visible: false, x: 220, y: 10, rotate: 6, z: 4, scale: 0.95 },
  ]
  const [grSlots, setGrSlots] = useState(defaultSlots)
  const updateSlot = (idx, key, val) => setGrSlots(prev => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s))
  const [asSubColor, setAsSubColor] = useState('')  // subtitle custom color
  const [images, setImages] = useState([])
  const [device, setDevice] = useState(DEVICES[0])
  const [bg, setBg] = useState(BACKGROUNDS[5])
  const [padding, setPadding] = useState(64)
  const [shadow, setShadow] = useState(SHADOWS[2])
  const [isDragging, setIsDragging] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [selectedId, setSelectedId] = useState(null)    // enlarged preview

  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0])

  // App Store tab state — global defaults
  const [asTitle, setAsTitle] = useState('')
  const [asSubtitle, setAsSubtitle] = useState('')
  const [asBgColor, setAsBgColor] = useState('#f0edf6')
  const [asTextColor, setAsTextColor] = useState('')
  const [asTitleSize, setAsTitleSize] = useState(18)
  const [asSubSize, setAsSubSize] = useState(11)
  const [asTextTop, setAsTextTop] = useState(22)
  const [asGap, setAsGap] = useState(0)
  const [textMode, setTextMode] = useState('global')   // 'global' | 'individual'
  const [activeFormats, setActiveFormats] = useState(['as-ip-6.7']) // checked format IDs
  const [previewFormat, setPreviewFormat] = useState(null) // format to preview in detail

  const [draftSaved, setDraftSaved] = useState(false)
  const fileInputRef = useRef(null)
  const cardRefs = useRef({})
  const graphicRef = useRef(null)
  const saveTimerRef = useRef(null)

  /* ── Draft auto-save / restore ────────────────────────────── */
  // Restore on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mockup-app-draft')
      if (!raw) return
      const draft = JSON.parse(raw)
      if (!draft || draft.version !== 1) return
      const s = draft.state
      if (s.tab) setTab(s.tab)
      if (s.lang) setLang(s.lang)
      if (s.deviceId) { const d = DEVICES.find(x => x.id === s.deviceId); if (d) setDevice(d) }
      if (s.bgId) { const b = BACKGROUNDS.find(x => x.id === s.bgId); if (b) setBg(b) }
      if (s.padding != null) setPadding(s.padding)
      if (s.shadowId) { const sh = SHADOWS.find(x => x.id === s.shadowId); if (sh) setShadow(sh) }
      if (s.frameColorId) { const fc = FRAME_COLORS.find(x => x.id === s.frameColorId); if (fc) setFrameColor(fc) }
      if (s.fontId) { const f = FONT_OPTIONS.find(x => x.id === s.fontId); if (f) setAsFont(f) }
      if (s.asBgColor) setAsBgColor(s.asBgColor)
      if (s.asTextColor) setAsTextColor(s.asTextColor)
      if (s.asSubColor) setAsSubColor(s.asSubColor)
      if (s.asTitle) setAsTitle(s.asTitle)
      if (s.asSubtitle) setAsSubtitle(s.asSubtitle)
      if (s.asTitleSize != null) setAsTitleSize(s.asTitleSize)
      if (s.asSubSize != null) setAsSubSize(s.asSubSize)
      if (s.asTextTop != null) setAsTextTop(s.asTextTop)
      if (s.asGap != null) setAsGap(s.asGap)
      if (s.textMode) setTextMode(s.textMode)
      if (s.activeFormats) setActiveFormats(s.activeFormats)
      if (s.graphicOrientation) setGraphicOrientation(s.graphicOrientation)
      if (s.graphicTitleSize != null) setGraphicTitleSize(s.graphicTitleSize)
      if (s.graphicSubSize != null) setGraphicSubSize(s.graphicSubSize)
      if (s.graphicShadow != null) setGraphicShadow(s.graphicShadow)
      if (s.graphicShowText != null) setGraphicShowText(s.graphicShowText)
      if (s.graphicTransparentBg != null) setGraphicTransparentBg(s.graphicTransparentBg)
      if (s.grTextOffsetX != null) setGrTextOffsetX(s.grTextOffsetX)
      if (s.grTextOffsetY != null) setGrTextOffsetY(s.grTextOffsetY)
      if (s.grSlots) setGrSlots(s.grSlots)
      if (draft.images?.length) setImages(draft.images)
    } catch (e) { console.warn('Draft restore failed:', e) }
  }, [])

  // Auto-save (debounced 2s)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        const draft = {
          version: 1,
          savedAt: new Date().toISOString(),
          state: {
            tab, lang, deviceId: device.id, bgId: bg.id, padding, shadowId: shadow.id,
            frameColorId: frameColor.id, fontId: asFont.id,
            asBgColor, asTextColor, asSubColor, asTitle, asSubtitle,
            asTitleSize, asSubSize, asTextTop, asGap, textMode, activeFormats,
            graphicOrientation, graphicTitleSize, graphicSubSize,
            graphicShadow, graphicShowText, graphicTransparentBg,
            grTextOffsetX, grTextOffsetY, grSlots,
          },
          images: images.slice(0, 20), // limit to 20 images to avoid localStorage overflow
        }
        localStorage.setItem('mockup-app-draft', JSON.stringify(draft))
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      } catch (e) { console.warn('Draft save failed:', e) }
    }, 2000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [tab, lang, device, bg, padding, shadow, frameColor, asFont,
      asBgColor, asTextColor, asSubColor, asTitle, asSubtitle,
      asTitleSize, asSubSize, asTextTop, asGap, textMode, activeFormats,
      graphicOrientation, graphicTitleSize, graphicSubSize,
      graphicShadow, graphicShowText, graphicTransparentBg,
      grTextOffsetX, grTextOffsetY, grSlots, images])

  /* ── File handling ─────────────────────────────────────────── */
  const handleFiles = useCallback((files) => {
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          src: e.target.result,
          name: file.name.replace(/\.[^.]+$/, ''),
          title: '',      // per-image text (used when textMode='individual')
          subtitle: '',
        }])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files) }, [handleFiles])
  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true) }, [])
  const onDragLeave = useCallback(() => setIsDragging(false), [])
  const onFileChange = useCallback((e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = '' }, [handleFiles])
  const removeImage = useCallback((id) => { setImages(prev => prev.filter(img => img.id !== id)); if (selectedId === id) setSelectedId(null) }, [selectedId])
  const clearAll = useCallback(() => { setImages([]); setSelectedId(null) }, [])
  const updateImage = useCallback((id, updates) => setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img)), [])

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
    const imgName = images.find(i => i.id === id)?.name || id
    try {
      if (tab === 'simple') {
        const el = cardRefs.current[id]
        if (!el) return
        const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: bg.isTransparent ? null : undefined })
        const link = document.createElement('a')
        link.download = `mockup-${imgName}.png`
        link.href = dataUrl
        link.click()
      } else if (tab === 'appstore') {
        // 첫 번째 활성 포맷의 ref를 사용
        const fmt = STORE_PRESETS.flatMap(s => s.formats).find(f => activeFormats.includes(f.id))
        if (!fmt) return
        const el = cardRefs.current[`${id}-${fmt.id}`]
        if (!el) return
        const ratio = fmt.w / 360
        const dataUrl = await toPng(el, { pixelRatio: ratio, cacheBust: true })
        const link = document.createElement('a')
        link.download = `mockup-${imgName}-${fmt.label.replace(/["\s]/g, '_')}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) { console.error('Export failed:', err) }
  }, [bg, images, tab, activeFormats])

  /* ── Export ALL as ZIP ─────────────────────────────────────── */
  const exportAllZip = useCallback(async () => {
    if (images.length === 0) return
    setExporting(true); setExportProgress(0)
    try {
      const zip = new JSZip()
      if (tab === 'simple') {
        for (let i = 0; i < images.length; i++) {
          const el = cardRefs.current[images[i].id]
          if (!el) continue
          const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: bg.isTransparent ? null : undefined })
          zip.file(`mockup-${images[i].name || i + 1}.png`, dataUrl.split(',')[1], { base64: true })
          setExportProgress(Math.round(((i + 1) / images.length) * 100))
        }
      } else {
        // App Store tab — export each image × each active format
        const allFormats = STORE_PRESETS.flatMap(s => s.formats).filter(f => activeFormats.includes(f.id))
        const total = images.length * allFormats.length
        let done = 0
        for (const img of images) {
          for (const fmt of allFormats) {
            const el = cardRefs.current[`${img.id}-${fmt.id}`] || cardRefs.current[img.id]
            if (!el) continue
            // Scale up from 360px canvas to target resolution
            const ratio = fmt.w / 360
            const dataUrl = await toPng(el, { pixelRatio: ratio, cacheBust: true })
            const folder = `${fmt.label.replace(/["\s]/g, '_')}`
            zip.file(`${folder}/mockup-${img.name || img.id}.png`, dataUrl.split(',')[1], { base64: true })
            done++
            setExportProgress(Math.round((done / total) * 100))
          }
        }
      }
      saveAs(await zip.generateAsync({ type: 'blob' }), `mockups_${new Date().getFullYear()}.zip`)
    } catch (err) { console.error('ZIP export failed:', err) }
    finally { setExporting(false); setExportProgress(0) }
  }, [images, bg, tab])

  // Resolve text per image
  const getTitle = (img) => textMode === 'individual' ? (img.title || '') : asTitle
  const getSubtitle = (img) => textMode === 'individual' ? (img.subtitle || '') : asSubtitle

  // First active format for preview aspect ratio
  const previewFmt = STORE_PRESETS.flatMap(s => s.formats).find(f => activeFormats.includes(f.id))
  const previewFmtDevice = previewFmt ? (DEVICES.find(d => d.id === previewFmt.deviceId) || device) : device
  const previewExportH = previewFmt ? 360 * (previewFmt.h / previewFmt.w) : undefined

  const previewBgHint = bg.isTransparent && tab === 'simple' ? { backgroundImage: checkerCSS, backgroundSize: '16px 16px' } : {}
  const thumbScale = tab === 'appstore' ? 0.55 : device.screenW > device.screenH ? 0.38 : device.type === 'browser' ? 0.44 : 0.42

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-3 lg:px-6 py-3 flex items-center justify-between shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="w-8 h-8" />
          <h1 className="text-[15px] font-bold text-gray-900">Screenshot & Mockup</h1>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">FREE</span>
          {/* Language toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5 ml-1">
            {[['en','EN'],['ko','KR'],['zh','中']].map(([code, label]) => (
              <button key={code} onClick={() => setLang(code)} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${lang === code ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>{label}</button>
            ))}
          </div>
          {images.length > 0 && <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{t.imgCount(images.length)}</span>}
        </div>
        <div className="flex items-center gap-2">
          {draftSaved && <span className="text-[10px] text-emerald-500 font-medium animate-pulse">Saved</span>}
          <button onClick={() => { localStorage.removeItem('mockup-app-draft'); window.location.reload() }} className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Reset all settings">
            Reset
          </button>
          {images.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" />{t.clearAll}
            </button>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 text-[13px] text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
            <ImagePlus className="w-4 h-4" />{t.addImages}
          </button>
          <button onClick={exportAllZip} disabled={images.length === 0 || exporting} className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {exporting ? <><Loader2 className="w-4 h-4 animate-spin" />{exportProgress}%</> : <><PackageCheck className="w-4 h-4" />Export All (ZIP)</>}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
      </header>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
        {/* ── MAIN PREVIEW ───────────────────────────────────── */}
        <main className="flex-1 min-h-0 overflow-auto p-4 lg:p-6">
          {images.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileInputRef.current?.click()}
                className={`w-full max-w-2xl aspect-[16/9] rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-4 transition-all ${isDragging ? 'border-violet-500 bg-violet-50 scale-[1.01]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragging ? 'bg-violet-100' : 'bg-gray-100'}`}>
                  <Upload className={`w-7 h-7 ${isDragging ? 'text-violet-600' : 'text-gray-300'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-[14px] font-semibold ${isDragging ? 'text-violet-700' : 'text-gray-500'}`}>{t.dropTitle}</p>
                  <p className="text-[12px] text-gray-400 mt-1">{t.dropSub}</p>
                </div>
              </div>
            </div>
          ) : tab === 'graphic' ? (
            /* Graphic tab — show large canvas preview */
            <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className="h-full flex flex-col items-center justify-center gap-4">
              {/* Hidden export target */}
              <div style={{ position: 'absolute', left: -99999, top: 0, pointerEvents: 'none', overflow: 'visible' }}>
                <StoreGraphicCard images={images} device={device} bgColor={graphicTransparentBg ? 'transparent' : asBgColor} title={asTitle} subtitle={asSubtitle} shadow={shadow} frameColor={frameColor} textColor={asTextColor} orientation={graphicOrientation} titleSize={graphicTitleSize} subSize={graphicSubSize} cardRef={graphicRef} scale={1} fontFamily={asFont.family} graphicShadow={graphicShadow} showText={graphicShowText} textOffsetX={grTextOffsetX} textOffsetY={grTextOffsetY} subTextColor={asSubColor} slots={grSlots} />
              </div>
              {/* Visible preview */}
              <StoreGraphicCard images={images} device={device} bgColor={graphicTransparentBg ? 'transparent' : asBgColor} title={asTitle} subtitle={asSubtitle} shadow={shadow} frameColor={frameColor} textColor={asTextColor} orientation={graphicOrientation} titleSize={graphicTitleSize} subSize={graphicSubSize} scale={0.95} fontFamily={asFont.family} graphicShadow={graphicShadow} showText={graphicShowText} textOffsetX={grTextOffsetX} textOffsetY={grTextOffsetY} subTextColor={asSubColor} slots={grSlots} />
              <button onClick={async () => {
                if (!graphicRef.current) return
                try {
                  const targetW = graphicOrientation === 'landscape' ? 4096 : 2000
                  const previewW = graphicOrientation === 'landscape' ? 620 : 320
                  const ratio = targetW / previewW
                  const dataUrl = await toPng(graphicRef.current, { pixelRatio: ratio, cacheBust: true, backgroundColor: graphicTransparentBg ? null : undefined })
                  const link = document.createElement('a')
                  link.download = `store-graphic-${Date.now()}.png`
                  link.href = dataUrl
                  link.click()
                } catch (err) { console.error(err) }
              }} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-[13px] font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                <Download className="w-4 h-4" />Download ({graphicOrientation === 'landscape' ? '4096×2000' : '2000×4096'})
              </button>
            </div>
          ) : (
            <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className="min-h-full flex flex-col gap-5">
              {/* ── Enlarged Preview ──────────────────────────── */}
              {selectedId && images.find(i => i.id === selectedId) && (() => {
                const sel = images.find(i => i.id === selectedId)
                return (
                  <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 sticky top-0 z-10 shadow-sm max-h-[60vh] overflow-auto">
                    <div className="flex items-center justify-between w-full shrink-0">
                      <span className="text-[12px] font-semibold text-gray-600">{sel.name}</span>
                      <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Minimize2 className="w-3 h-3" />{t.collapse}
                      </button>
                    </div>
                    <div className="flex items-center justify-center" style={{ ...previewBgHint, borderRadius: 12, overflow: 'hidden' }}>
                      {tab === 'simple' ? (
                        <SimpleMockupCard src={sel.src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} scale={0.8} />
                      ) : (
                        <AppStoreMockupCard src={sel.src} device={previewFmtDevice} bgColor={asBgColor} title={getTitle(sel)} subtitle={getSubtitle(sel)} shadow={shadow} frameColor={frameColor} textColor={asTextColor} titleSize={asTitleSize} subSize={asSubSize} textTop={asTextTop} gap={asGap} exportW={360} exportH={previewExportH} scale={0.9} fontFamily={asFont.family} subTextColor={asSubColor} />
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* ── Thumbnail Grid ───────────────────────────── */}
              <div className="grid gap-5" style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${
                  tab === 'appstore' ? '220px' : device.screenW > device.screenH ? '320px' : device.type === 'browser' ? '240px' : '180px'
                }, 1fr))`,
              }}>
                {images.map((img) => (
                  <div key={img.id} className="group relative flex flex-col items-center">
                    {/* Hidden full-res export targets */}
                    <div style={{ position: 'absolute', left: -99999, top: 0, pointerEvents: 'none', overflow: 'visible' }}>
                      {tab === 'simple' ? (
                        <SimpleMockupCard src={img.src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} cardRef={el => { cardRefs.current[img.id] = el }} scale={1} />
                      ) : (
                        /* Render one hidden card per active format — each has correct aspect ratio */
                        STORE_PRESETS.flatMap(s => s.formats).filter(f => activeFormats.includes(f.id)).map(fmt => {
                          const fmtDevice = DEVICES.find(d => d.id === fmt.deviceId) || device
                          return <AppStoreMockupCard key={fmt.id} src={img.src} device={fmtDevice} bgColor={asBgColor} title={getTitle(img)} subtitle={getSubtitle(img)} shadow={shadow} frameColor={frameColor} textColor={asTextColor} titleSize={asTitleSize} subSize={asSubSize} textTop={asTextTop} gap={asGap} exportW={360} exportH={360 * (fmt.h / fmt.w)} cardRef={el => { cardRefs.current[`${img.id}-${fmt.id}`] = el }} scale={1} fontFamily={asFont.family} subTextColor={asSubColor} />
                        })
                      )}
                    </div>

                    {/* Visible thumb — click to enlarge */}
                    <div
                      onClick={() => setSelectedId(selectedId === img.id ? null : img.id)}
                      className={`rounded-xl overflow-hidden w-full flex items-center justify-center p-2 cursor-pointer transition-all ${selectedId === img.id ? 'ring-2 ring-violet-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}`}
                      style={{ ...previewBgHint, minHeight: 140 }}
                    >
                      {tab === 'simple' ? (
                        <SimpleMockupCard src={img.src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} scale={thumbScale} />
                      ) : (
                        <AppStoreMockupCard src={img.src} device={previewFmtDevice} bgColor={asBgColor} title={getTitle(img)} subtitle={getSubtitle(img)} shadow={shadow} frameColor={frameColor} textColor={asTextColor} titleSize={asTitleSize} subSize={asSubSize} textTop={asTextTop} gap={asGap} exportW={360} exportH={previewExportH} scale={thumbScale} fontFamily={asFont.family} subTextColor={asSubColor} />
                      )}
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => exportSingle(img.id)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white" title="Download"><Download className="w-3.5 h-3.5 text-gray-600" /></button>
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50" title="Remove"><X className="w-3.5 h-3.5 text-gray-500" /></button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 truncate max-w-full px-2 font-medium">{img.name}</p>
                  </div>
                ))}

                <div onClick={() => fileInputRef.current?.click()} className="rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[160px] transition-colors hover:bg-gray-50">
                  <ImagePlus className="w-5 h-5 text-gray-300" /><span className="text-[11px] text-gray-400 font-medium">{t.add}</span>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ── SIDEBAR ────────────────────────────────────────── */}
        <aside className="w-full lg:w-[276px] bg-white border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto shrink-0 flex flex-col max-h-[70vh] lg:max-h-none">
          {/* Segmented Control */}
          <div className="p-4 pb-2">
            <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
              {[['simple', t.simpleDevice], ['appstore', t.storeScreenshot], ['graphic', 'Graphic']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="p-4 pt-2 flex flex-col gap-5 flex-1">
            {/* ── SHARED: Device Frame ──────────────────────── */}
            <Section title={t.deviceFrame} icon={Smartphone}>
              <div className="flex flex-col gap-3">
                <DeviceGroup label="iPhone" devices={DEVICES.filter(d => d.type === 'iphone')} current={device} onSelect={setDevice} />
                <DeviceGroup label="Galaxy" devices={DEVICES.filter(d => d.type === 'samsung')} current={device} onSelect={setDevice} tag="Android" />
                {tab === 'appstore' && <>
                  <DeviceGroup label="iPad" devices={DEVICES.filter(d => d.type === 'ipad')} current={device} onSelect={setDevice} />
                  <DeviceGroup label="Android Tablet" devices={DEVICES.filter(d => d.type === 'android-tab')} current={device} onSelect={setDevice} tag="Android" />
                </>}
                {tab === 'simple' && <>
                  <DeviceGroup label="iPad" devices={DEVICES.filter(d => d.type === 'ipad')} current={device} onSelect={setDevice} />
                  <DeviceGroup label="Browser" devices={DEVICES.filter(d => d.type === 'browser')} current={device} onSelect={setDevice} />
                  <DeviceGroup label="Glass" devices={DEVICES.filter(d => d.type === 'glass')} current={device} onSelect={setDevice} />
                </>}
              </div>
            </Section>

            {/* ── SHARED: Frame Color (phone only) ──────────── */}
            {(device.type === 'iphone' || device.type === 'samsung' || device.type === 'ipad' || device.type === 'android-tab') && (
              <Section title={t.frameColor} icon={Sun}>
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
                <Section title={t.background} icon={Sun}>
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

                <Section title={t.padding} icon={Move}>
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
                {/* Store format presets */}
                <Section title={t.storeSize} icon={PackageCheck}>
                  {STORE_PRESETS.map(store => (
                    <div key={store.id} className="mb-3">
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">{store.label}</p>
                      <div className="flex flex-col gap-1">
                        {store.formats.map(fmt => (
                          <label key={fmt.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-[11px]">
                            <input type="checkbox" checked={activeFormats.includes(fmt.id)} onChange={e => {
                              if (e.target.checked) setActiveFormats(prev => [...prev, fmt.id])
                              else setActiveFormats(prev => prev.filter(x => x !== fmt.id))
                            }} className="accent-violet-600 w-3.5 h-3.5" />
                            <span className="font-semibold text-gray-700 flex-1">{fmt.label}</span>
                            <span className="text-[9px] text-gray-400 font-mono">{fmt.w}×{fmt.h}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 mt-1">{t.storeSizeHint}</p>
                </Section>

                <Section title={t.bgColor} icon={Sun}>
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

                <Section title={t.textColor} icon={Type}>
                  <div className="flex items-center gap-2">
                    <input type="color" value={asTextColor || (isLightColor(asBgColor) ? '#111111' : '#ffffff')} onChange={e => setAsTextColor(e.target.value)} className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                    <input type="text" value={asTextColor || 'Auto'} onChange={e => setAsTextColor(e.target.value)} placeholder="Auto" className="flex-1 text-[12px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-300" />
                    {asTextColor && <button onClick={() => setAsTextColor('')} className="text-[10px] text-gray-400 hover:text-gray-600 px-1">Auto</button>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={asSubColor || (isLightColor(asBgColor) ? '#555555' : '#bbbbbb')} onChange={e => setAsSubColor(e.target.value)} className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                    <input type="text" value={asSubColor || 'Auto'} onChange={e => setAsSubColor(e.target.value)} placeholder="소제목 Auto" className="flex-1 text-[12px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-300" />
                    {asSubColor && <button onClick={() => setAsSubColor('')} className="text-[10px] text-gray-400 hover:text-gray-600 px-1">Auto</button>}
                  </div>
                </Section>

                {/* Text mode toggle */}
                <Section title={t.text} icon={Type}>
                  <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 mb-3">
                    <button onClick={() => setTextMode('global')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${textMode === 'global' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>{t.globalApply}</button>
                    <button onClick={() => setTextMode('individual')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${textMode === 'individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>{t.individualApply}</button>
                  </div>

                  {textMode === 'global' ? (
                    <>
                      <label className="text-[10px] text-gray-400 font-bold mb-1 block">{t.title}</label>
                      <input type="text" value={asTitle} onChange={e => setAsTitle(e.target.value)} placeholder={t.titlePlaceholder} className="w-full text-[13px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 font-semibold mb-2" />
                      <label className="text-[10px] text-gray-400 font-bold mb-1 block">{t.subtitle}</label>
                      <textarea value={asSubtitle} onChange={e => setAsSubtitle(e.target.value)} placeholder={t.subtitlePlaceholder} rows={2} className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
                    </>
                  ) : selectedId && images.find(i => i.id === selectedId) ? (() => {
                    const sel = images.find(i => i.id === selectedId)
                    return (
                      <>
                        <p className="text-[10px] text-violet-500 font-bold mb-2">📌 {sel.name} — {t.editingImg}</p>
                        <label className="text-[10px] text-gray-400 font-bold mb-1 block">{t.title}</label>
                        <input type="text" value={sel.title} onChange={e => updateImage(sel.id, { title: e.target.value })} placeholder={t.titlePlaceholder} className="w-full text-[13px] bg-gray-50 border border-violet-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 font-semibold mb-2" />
                        <label className="text-[10px] text-gray-400 font-bold mb-1 block">{t.subtitle}</label>
                        <textarea value={sel.subtitle} onChange={e => updateImage(sel.id, { subtitle: e.target.value })} placeholder={t.subtitlePlaceholder} rows={2} className="w-full text-[12px] bg-gray-50 border border-violet-200 rounded-xl px-3 py-2.5 text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
                      </>
                    )
                  })() : (
                    <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg p-3 text-center">{t.selectToEdit}</p>
                  )}
                </Section>

                {/* Text size — always global (layout) */}
                <Section title="폰트" icon={Type}>
                  <div className="flex gap-1.5">
                    {FONT_OPTIONS.map(f => (
                      <button key={f.id} onClick={() => setAsFont(f)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${asFont.id === f.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`} style={{ fontFamily: f.family }}>{f.label}</button>
                    ))}
                  </div>
                </Section>

                <Section title={t.textSize} icon={Type}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-12 shrink-0">{t.title}</span>
                    <input type="range" min={10} max={36} value={asTitleSize} onChange={e => setAsTitleSize(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{asTitleSize}px</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400 w-12 shrink-0">{t.subtitle}</span>
                    <input type="range" min={8} max={24} value={asSubSize} onChange={e => setAsSubSize(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{asSubSize}px</span>
                  </div>
                </Section>

                <Section title={t.textPos} icon={Move}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-8 shrink-0">{t.height}</span>
                    <input type="range" min={12} max={40} value={asTextTop} onChange={e => setAsTextTop(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{asTextTop}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400 w-8 shrink-0">{t.gap}</span>
                    <input type="range" min={-150} max={40} value={asGap} onChange={e => setAsGap(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{asGap}px</span>
                  </div>
                </Section>
              </>
            )}

            {/* ── TAB 3: Graphic ─────────────────────────────── */}
            {tab === 'graphic' && (
              <>
                <Section title={t.bgColor} icon={Sun}>
                  <div className="flex items-center gap-2">
                    <input type="color" value={asBgColor} onChange={e => { setAsBgColor(e.target.value); setGraphicTransparentBg(false) }} className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                    <input type="text" value={graphicTransparentBg ? 'transparent' : asBgColor} onChange={e => { setAsBgColor(e.target.value); setGraphicTransparentBg(false) }} className="flex-1 text-[12px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-300" />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => setGraphicTransparentBg(!graphicTransparentBg)} className={`w-7 h-7 rounded-lg border transition-all ${graphicTransparentBg ? 'ring-2 ring-gray-900 ring-offset-1 scale-110' : 'border-gray-200 hover:scale-105'}`} style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }} title="투명" />
                    {['#e8e4df', '#f0edf6', '#1a1a2e', '#0f172a', '#fef3e2', '#e8f4f8'].map(c => (
                      <button key={c} onClick={() => { setAsBgColor(c); setGraphicTransparentBg(false) }} className={`w-7 h-7 rounded-lg border transition-all ${!graphicTransparentBg && asBgColor === c ? 'ring-2 ring-gray-900 ring-offset-1 scale-110' : 'border-gray-200 hover:scale-105'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </Section>

                <Section title="Layout" icon={Layers}>
                  <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                    <button onClick={() => setGraphicOrientation('landscape')} className={`flex-1 py-2 text-[11px] font-bold rounded-md transition-all ${graphicOrientation === 'landscape' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Landscape</button>
                    <button onClick={() => setGraphicOrientation('portrait')} className={`flex-1 py-2 text-[11px] font-bold rounded-md transition-all ${graphicOrientation === 'portrait' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Portrait</button>
                  </div>
                </Section>

                <Section title={t.text} icon={Type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-400 font-bold">텍스트 표시</span>
                    <button onClick={() => setGraphicShowText(!graphicShowText)} className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${graphicShowText ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>{graphicShowText ? 'ON' : 'OFF'}</button>
                  </div>
                  {graphicShowText && (
                    <>
                      <label className="text-[10px] text-gray-400 font-bold mb-1 block">{t.title}</label>
                      <input type="text" value={asTitle} onChange={e => setAsTitle(e.target.value)} placeholder={t.titlePlaceholder} className="w-full text-[13px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 font-semibold mb-2" />
                      <label className="text-[10px] text-gray-400 font-bold mb-1 block">{t.subtitle}</label>
                      <textarea value={asSubtitle} onChange={e => setAsSubtitle(e.target.value)} placeholder={t.subtitlePlaceholder} rows={2} className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
                    </>
                  )}
                </Section>

                <Section title="폰트" icon={Type}>
                  <div className="flex gap-1.5">
                    {FONT_OPTIONS.map(f => (
                      <button key={f.id} onClick={() => setAsFont(f)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${asFont.id === f.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`} style={{ fontFamily: f.family }}>{f.label}</button>
                    ))}
                  </div>
                </Section>

                <Section title={t.textSize} icon={Type}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-12 shrink-0">{t.title}</span>
                    <input type="range" min={12} max={48} value={graphicTitleSize} onChange={e => setGraphicTitleSize(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{graphicTitleSize}px</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400 w-12 shrink-0">{t.subtitle}</span>
                    <input type="range" min={8} max={28} value={graphicSubSize} onChange={e => setGraphicSubSize(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{graphicSubSize}px</span>
                  </div>
                </Section>

                <Section title="텍스트 위치" icon={Move}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-12 shrink-0">좌우</span>
                    <input type="range" min={-150} max={150} value={grTextOffsetX} onChange={e => setGrTextOffsetX(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{grTextOffsetX}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400 w-12 shrink-0">상하</span>
                    <input type="range" min={-150} max={150} value={grTextOffsetY} onChange={e => setGrTextOffsetY(Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{grTextOffsetY}</span>
                  </div>
                </Section>

                {grSlots.map((slot, i) => (
                  <Section key={i} title={`기기 ${i + 1}`} icon={Smartphone}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-400 font-bold">표시</span>
                      <button onClick={() => updateSlot(i, 'visible', !slot.visible)} className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${slot.visible ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>{slot.visible ? 'ON' : 'OFF'}</button>
                    </div>
                    {slot.visible && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 w-8 shrink-0">좌우</span>
                          <input type="range" min={-250} max={250} value={slot.x} onChange={e => updateSlot(i, 'x', Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                          <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{slot.x}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 w-8 shrink-0">상하</span>
                          <input type="range" min={-250} max={250} value={slot.y} onChange={e => updateSlot(i, 'y', Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                          <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{slot.y}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 w-8 shrink-0">회전</span>
                          <input type="range" min={-30} max={30} value={slot.rotate} onChange={e => updateSlot(i, 'rotate', Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                          <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{slot.rotate}°</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 w-8 shrink-0">크기</span>
                          <input type="range" min={50} max={150} value={Math.round(slot.scale * 100)} onChange={e => updateSlot(i, 'scale', Number(e.target.value) / 100)} className="flex-1 accent-gray-900 h-1" />
                          <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{Math.round(slot.scale * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 w-8 shrink-0">순서</span>
                          <input type="range" min={1} max={4} value={slot.z} onChange={e => updateSlot(i, 'z', Number(e.target.value))} className="flex-1 accent-gray-900 h-1" />
                          <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{slot.z}</span>
                        </div>
                      </>
                    )}
                  </Section>
                ))}

                <Section title="목업 설정" icon={Layers}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-12 shrink-0">그림자</span>
                    <button onClick={() => setGraphicShadow(!graphicShadow)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${graphicShadow ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'}`}>{graphicShadow ? 'ON' : 'OFF'}</button>
                  </div>
                </Section>
              </>
            )}

            {/* ── SHARED: Shadow ────────────────────────────── */}
            <Section title={t.shadow} icon={Layers}>
              <div className="grid grid-cols-2 gap-1.5">
                {SHADOWS.map(s => (
                  <button key={s.id} onClick={() => setShadow(s)} className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${shadow.id === s.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{s.label}</button>
                ))}
              </div>
            </Section>

            {images.length === 0 && (
              <div className="mt-auto p-4 bg-gray-50 rounded-xl">
                <p className="text-[11px] text-gray-400"><span className="font-semibold text-gray-600">Tip: </span>
                  {tab === 'simple' ? t.tipSimple : t.tipStore}
                </p>
              </div>
            )}

          </div>
        </aside>
      </div>

      {/* Google AdSense auto ads handle placement automatically */}

      {/* ── Export overlay ────────────────────────────────────── */}
      {exporting && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[280px]">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            <p className="text-[14px] font-semibold text-gray-800">{t.generating}</p>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-violet-600 h-full rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
            </div>
            <p className="text-[12px] text-gray-400">{exportProgress}% {t.complete}</p>
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
