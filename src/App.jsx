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
    template: 'Template',
    templateHint: 'Tap to apply a preset style',
    textPresets: 'Text Presets',
    perspective: '3D Perspective',
    rotateX: 'Rotate X',
    rotateY: 'Rotate Y',
    rotateZ: 'Rotate Z',
    customFont: 'Custom Font',
    uploadFont: 'Upload Font (TTF/OTF)',
    autoTranslate: 'Auto Translate',
    translateTo: 'Translate to',
    tryDemo: 'Try Demo',
    tryDemoDesc: 'Load sample screenshots',
    projects: 'Projects',
    newProject: 'New Project',
    saveProject: 'Save',
    loadProject: 'Load',
    exportInfo: 'Export Info',
    checkedCount: (n) => `${n} selected`,
    beforeAfter: 'Before / After',
    beforeAfterDesc: 'Compare two screenshots',
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
    template: '템플릿',
    templateHint: '클릭하면 프리셋 스타일이 적용됩니다',
    textPresets: '텍스트 프리셋',
    perspective: '3D 원근',
    rotateX: 'X 회전',
    rotateY: 'Y 회전',
    rotateZ: 'Z 회전',
    customFont: '커스텀 폰트',
    uploadFont: '폰트 업로드 (TTF/OTF)',
    autoTranslate: '자동 번역',
    translateTo: '번역 대상',
    tryDemo: '데모 체험',
    tryDemoDesc: '샘플 스크린샷 불러오기',
    projects: '프로젝트',
    newProject: '새 프로젝트',
    saveProject: '저장',
    loadProject: '불러오기',
    exportInfo: '내보내기 정보',
    checkedCount: (n) => `${n}개 선택됨`,
    beforeAfter: 'Before / After',
    beforeAfterDesc: '두 스크린샷 비교',
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
  // iPhones with Dynamic Island — statusBarH/islandW/islandH/islandTop in screen pt
  { id: 'iphone16-pro-max', name: 'iPhone 16 Pro Max', icon: Smartphone, screenW: 440, screenH: 956, frameWidth: 290, frameRadius: 44, bezel: 8, type: 'iphone', statusBarH: 54, hasIsland: true, islandW: 125, islandH: 37, islandTop: 11 },
  { id: 'iphone16-pro', name: 'iPhone 16 Pro', icon: Smartphone, screenW: 402, screenH: 874, frameWidth: 280, frameRadius: 42, bezel: 8, type: 'iphone', statusBarH: 54, hasIsland: true, islandW: 125, islandH: 37, islandTop: 11 },
  { id: 'iphone16', name: 'iPhone 16', icon: Smartphone, screenW: 393, screenH: 852, frameWidth: 272, frameRadius: 42, bezel: 8, type: 'iphone', statusBarH: 54, hasIsland: true, islandW: 125, islandH: 37, islandTop: 11 },
  // Samsung — punch-hole camera, full-width status bar
  { id: 'galaxy-s25-ultra', name: 'Galaxy S25 Ultra', icon: Smartphone, screenW: 412, screenH: 892, frameWidth: 258, frameRadius: 36, bezel: 7, type: 'samsung', statusBarH: 40, hasIsland: false },
  { id: 'galaxy-s25-plus', name: 'Galaxy S25+', icon: Smartphone, screenW: 412, screenH: 883, frameWidth: 252, frameRadius: 34, bezel: 7, type: 'samsung', statusBarH: 40, hasIsland: false },
  { id: 'galaxy-s25', name: 'Galaxy S25', icon: Smartphone, screenW: 360, screenH: 780, frameWidth: 242, frameRadius: 32, bezel: 7, type: 'samsung', statusBarH: 36, hasIsland: false },
  // ── iPad ──────────────────────────────────────────────────
  { id: 'ipad-pro-13', name: 'iPad Pro 13"', icon: Monitor, screenW: 2048, screenH: 2732, frameWidth: 340, frameRadius: 24, bezel: 12, type: 'ipad', statusBarH: 48, hasIsland: false },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', icon: Monitor, screenW: 1668, screenH: 2388, frameWidth: 320, frameRadius: 22, bezel: 12, type: 'ipad', statusBarH: 44, hasIsland: false },
  // ── Android Tablet ───────────────────────────────────────
  { id: 'android-tab-10', name: 'Android Tablet 10"', icon: Monitor, screenW: 1920, screenH: 2560, frameWidth: 330, frameRadius: 20, bezel: 10, type: 'android-tab', statusBarH: 60, hasIsland: false },
  // ── Browser ────────────────────────────────────────────────
  { id: 'browser-landscape', name: 'Browser (가로)', icon: Monitor, screenW: 1440, screenH: 900, frameWidth: 520, frameRadius: 12, bezel: 0, type: 'browser' },
  { id: 'browser-portrait', name: 'Browser (세로)', icon: Monitor, screenW: 768, screenH: 1024, frameWidth: 360, frameRadius: 12, bezel: 0, type: 'browser' },
  { id: 'glass-landscape', name: 'Glass (가로)', icon: Square, screenW: 16, screenH: 10, frameWidth: 460, frameRadius: 24, bezel: 0, type: 'glass' },
  { id: 'glass-portrait', name: 'Glass (세로)', icon: Square, screenW: 9, screenH: 16, frameWidth: 300, frameRadius: 24, bezel: 0, type: 'glass' },
]

const BACKGROUNDS = [
  { id: 'transparent', label: 'Transparent', value: 'transparent', isTransparent: true },
  // Solid colors
  { id: 'slate', label: 'Slate', value: '#1e293b' },
  { id: 'white', label: 'White', value: '#ffffff' },
  { id: 'zinc', label: 'Zinc', value: '#27272a' },
  { id: 'stone', label: 'Stone', value: '#f5f5f4' },
  // Classic gradients
  { id: 'ocean', label: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'sunset', label: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'aurora', label: 'Aurora', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'mint', label: 'Mint', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'peach', label: 'Peach', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'night', label: 'Night', value: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)' },
  { id: 'candy', label: 'Candy', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  // Trendy brand-inspired gradients
  { id: 'instagram', label: 'Insta', value: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
  { id: 'spotify', label: 'Spotify', value: 'linear-gradient(135deg, #1db954 0%, #191414 100%)' },
  { id: 'cosmic', label: 'Cosmic', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'violet', label: 'Violet', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 'lime', label: 'Lime', value: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { id: 'royal', label: 'Royal', value: 'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)' },
  { id: 'flame', label: 'Flame', value: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' },
  { id: 'forest', label: 'Forest', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  // Mesh gradients (radial)
  { id: 'mesh-pink', label: 'Mesh P', value: 'radial-gradient(at 27% 37%, #ff79c6 0, transparent 50%), radial-gradient(at 97% 21%, #bd93f9 0, transparent 50%), radial-gradient(at 52% 99%, #ffb86c 0, transparent 50%), radial-gradient(at 10% 29%, #ff5555 0, transparent 50%), #282a36' },
  { id: 'mesh-blue', label: 'Mesh B', value: 'radial-gradient(at 40% 20%, #8ec5fc 0, transparent 50%), radial-gradient(at 80% 0%, #e0c3fc 0, transparent 50%), radial-gradient(at 0% 50%, #96e6a1 0, transparent 50%), #667eea' },
  { id: 'mesh-dark', label: 'Mesh D', value: 'radial-gradient(at 0% 0%, #6366f1 0, transparent 50%), radial-gradient(at 100% 0%, #ec4899 0, transparent 50%), radial-gradient(at 50% 100%, #8b5cf6 0, transparent 50%), #0f172a' },
  // Pastel
  { id: 'pastel-pink', label: 'Pink', value: 'linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)' },
  { id: 'pastel-sky', label: 'Sky', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { id: 'pastel-sand', label: 'Sand', value: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' },
]

/* ═══════════════════════════════════════════════════════════════
   TEMPLATES — preset layouts for quick start
   ═══════════════════════════════════════════════════════════════ */
const TEMPLATES = [
  { id: 'tmpl-clean', label: '✨ Clean', desc: 'Simple white', bgId: 'white', shadowId: 'medium', asBgColor: '#ffffff', asTitleSize: 20, asSubSize: 12, asTextTop: 18, asGap: 8 },
  { id: 'tmpl-brand', label: '💜 Brand', desc: 'Purple violet', bgId: 'ocean', shadowId: 'high', asBgColor: '#6d28d9', asTextColor: '#ffffff', asSubColor: '#e9d5ff', asTitleSize: 22, asSubSize: 13, asTextTop: 20 },
  { id: 'tmpl-feature', label: '⭐ Feature', desc: 'Bold gradient', bgId: 'sunset', shadowId: 'high', asBgColor: '#f5576c', asTextColor: '#ffffff', asSubColor: '#ffe4e1', asTitleSize: 24, asSubSize: 13, asTextTop: 16 },
  { id: 'tmpl-dark', label: '🌙 Dark', desc: 'Night mode', bgId: 'night', shadowId: 'high', asBgColor: '#0f172a', asTextColor: '#ffffff', asSubColor: '#94a3b8', asTitleSize: 22, asSubSize: 12, asTextTop: 20 },
  { id: 'tmpl-mint', label: '🌿 Mint', desc: 'Fresh green', bgId: 'mint', shadowId: 'medium', asBgColor: '#43e97b', asTextColor: '#064e3b', asSubColor: '#065f46', asTitleSize: 22, asSubSize: 13, asTextTop: 18 },
  { id: 'tmpl-peach', label: '🍑 Peach', desc: 'Warm soft', bgId: 'peach', shadowId: 'soft', asBgColor: '#fcb69f', asTextColor: '#7c2d12', asSubColor: '#9a3412', asTitleSize: 20, asSubSize: 12, asTextTop: 20 },
  { id: 'tmpl-cosmic', label: '🌌 Cosmic', desc: 'Orange pink', bgId: 'cosmic', shadowId: 'high', asBgColor: '#fa709a', asTextColor: '#ffffff', asSubColor: '#fff7ed', asTitleSize: 24, asSubSize: 13, asTextTop: 18 },
  { id: 'tmpl-royal', label: '👑 Royal', desc: 'Blue purple', bgId: 'royal', shadowId: 'high', asBgColor: '#6366f1', asTextColor: '#ffffff', asSubColor: '#c7d2fe', asTitleSize: 22, asSubSize: 13, asTextTop: 20 },
  { id: 'tmpl-mesh', label: '🎨 Mesh', desc: 'Artistic', bgId: 'mesh-pink', shadowId: 'high', asBgColor: '#282a36', asTextColor: '#ffffff', asSubColor: '#f8f8f2', asTitleSize: 22, asSubSize: 12, asTextTop: 18 },
  { id: 'tmpl-minimal', label: '⚪ Minimal', desc: 'Clean gray', bgId: 'stone', shadowId: 'soft', asBgColor: '#f5f5f4', asTextColor: '#1c1917', asSubColor: '#57534e', asTitleSize: 18, asSubSize: 11, asTextTop: 20, asGap: 4 },
]

/* ═══════════════════════════════════════════════════════════════
   TEXT PRESETS — headline + subtitle combos for quick fill
   ═══════════════════════════════════════════════════════════════ */
const TEXT_PRESETS = {
  en: [
    { title: 'Track everything you need', sub: 'Simple. Fast. Beautiful.' },
    { title: 'Your daily companion', sub: 'Manage tasks effortlessly' },
    { title: 'Made for creators', sub: 'Craft with confidence' },
    { title: 'Designed for focus', sub: 'Everything in one place' },
    { title: 'Get started in seconds', sub: 'No setup required' },
    { title: 'Boost your productivity', sub: 'Work smarter, not harder' },
    { title: 'Beautiful & intuitive', sub: 'Love at first tap' },
    { title: 'Trusted by millions', sub: 'Join our community' },
  ],
  ko: [
    { title: '필요한 모든 것을 한 번에', sub: '간편하고 빠르게 시작하세요' },
    { title: '당신의 하루를 바꾸는 앱', sub: '작업을 손쉽게 관리하세요' },
    { title: '창작자를 위해 만들었습니다', sub: '자신있게 만들어가세요' },
    { title: '집중을 위한 설계', sub: '모든 것을 한 곳에서' },
    { title: '몇 초 만에 시작하기', sub: '설정이 필요 없습니다' },
    { title: '생산성을 높여보세요', sub: '더 스마트하게 일하세요' },
    { title: '아름답고 직관적인', sub: '한 번 쓰면 빠져드는' },
    { title: '수백만이 선택한 앱', sub: '지금 함께하세요' },
  ],
  zh: [
    { title: '一站式管理', sub: '简单・快速・精美' },
    { title: '您的日常伙伴', sub: '轻松管理任务' },
    { title: '为创作者打造', sub: '自信地创造' },
    { title: '专注设计', sub: '一切尽在掌握' },
    { title: '几秒即可开始', sub: '无需设置' },
    { title: '提升效率', sub: '聪明工作' },
    { title: '美观直观', sub: '一见倾心' },
    { title: '千万用户之选', sub: '加入我们' },
  ],
}

/* ═══════════════════════════════════════════════════════════════
   PHRASE TRANSLATIONS — quick dictionary for auto-translate
   ═══════════════════════════════════════════════════════════════ */
const PHRASE_DICT = {
  // ko -> other
  '필요한 모든 것을 한 번에': { en: 'Everything you need, in one place', zh: '一站式管理', ja: '必要なものすべてを一括で' },
  '간편하고 빠르게 시작하세요': { en: 'Simple and fast to start', zh: '简单快速开始', ja: 'シンプルで素早くスタート' },
  '당신의 하루를 바꾸는 앱': { en: 'The app that changes your day', zh: '改变你一天的应用', ja: 'あなたの一日を変えるアプリ' },
  '창작자를 위해 만들었습니다': { en: 'Made for creators', zh: '为创作者打造', ja: 'クリエイターのために作られました' },
  '집중을 위한 설계': { en: 'Designed for focus', zh: '专注设计', ja: '集中のための設計' },
  '생산성을 높여보세요': { en: 'Boost your productivity', zh: '提升您的效率', ja: '生産性を向上させよう' },
  '몇 초 만에 시작하기': { en: 'Get started in seconds', zh: '几秒即可开始', ja: '数秒で開始' },
  '아름답고 직관적인': { en: 'Beautiful & intuitive', zh: '美观直观', ja: '美しく直感的' },
  '수백만이 선택한 앱': { en: 'Trusted by millions', zh: '千万用户之选', ja: '何百万人にも選ばれたアプリ' },
}

/* ═══════════════════════════════════════════════════════════════
   FORMAT BADGES — indicate required vs optional
   ═══════════════════════════════════════════════════════════════ */
const FORMAT_BADGES = {
  'as-ip-6.7': { type: 'required', label: 'Required' },
  'as-ip-6.5': { type: 'required', label: 'Required' },
  'as-ipad-13': { type: 'required', label: 'Required' },
  'ps-phone-fhd': { type: 'required', label: 'Required' },
  'ps-tab-10': { type: 'required', label: 'Required' },
}

/* ═══════════════════════════════════════════════════════════════
   DEMO SAMPLES — placeholder SVG screenshots for "Try Demo"
   ═══════════════════════════════════════════════════════════════ */
const makeDemoSvg = (bg, fg, title, icon) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 844' width='390' height='844'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='${bg}'/>
        <stop offset='100%' stop-color='${fg}'/>
      </linearGradient>
    </defs>
    <rect width='390' height='844' fill='url(#g)'/>
    <text x='195' y='80' text-anchor='middle' font-family='system-ui,sans-serif' font-size='48' fill='white' opacity='0.95'>${icon}</text>
    <text x='195' y='150' text-anchor='middle' font-family='system-ui,sans-serif' font-size='22' font-weight='700' fill='white'>${title}</text>
    <rect x='40' y='220' width='310' height='80' rx='16' fill='white' opacity='0.15'/>
    <rect x='40' y='320' width='310' height='80' rx='16' fill='white' opacity='0.15'/>
    <rect x='40' y='420' width='310' height='80' rx='16' fill='white' opacity='0.15'/>
    <rect x='40' y='520' width='310' height='80' rx='16' fill='white' opacity='0.15'/>
    <circle cx='70' cy='260' r='22' fill='white' opacity='0.35'/>
    <circle cx='70' cy='360' r='22' fill='white' opacity='0.35'/>
    <circle cx='70' cy='460' r='22' fill='white' opacity='0.35'/>
    <circle cx='70' cy='560' r='22' fill='white' opacity='0.35'/>
    <rect x='110' y='245' width='160' height='12' rx='6' fill='white' opacity='0.55'/>
    <rect x='110' y='267' width='100' height='10' rx='5' fill='white' opacity='0.35'/>
    <rect x='110' y='345' width='180' height='12' rx='6' fill='white' opacity='0.55'/>
    <rect x='110' y='367' width='120' height='10' rx='5' fill='white' opacity='0.35'/>
    <rect x='110' y='445' width='140' height='12' rx='6' fill='white' opacity='0.55'/>
    <rect x='110' y='467' width='90' height='10' rx='5' fill='white' opacity='0.35'/>
    <rect x='110' y='545' width='170' height='12' rx='6' fill='white' opacity='0.55'/>
    <rect x='110' y='567' width='110' height='10' rx='5' fill='white' opacity='0.35'/>
    <rect x='120' y='720' width='150' height='56' rx='28' fill='white' opacity='0.9'/>
    <text x='195' y='755' text-anchor='middle' font-family='system-ui,sans-serif' font-size='16' font-weight='700' fill='${bg}'>Get Started</text>
  </svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}
const DEMO_SAMPLES = [
  // bg = gradient start (top), fg = gradient end (bottom) — reused as bottomColor for smart fill
  { id: 'demo-1', name: 'Home',     src: makeDemoSvg('#667eea', '#764ba2', 'Welcome',    '✨'), topColor: '#667eea', bottomColor: '#764ba2' },
  { id: 'demo-2', name: 'Features', src: makeDemoSvg('#f093fb', '#f5576c', 'Features',   '⭐'), topColor: '#f093fb', bottomColor: '#f5576c' },
  { id: 'demo-3', name: 'Stats',    src: makeDemoSvg('#43e97b', '#38f9d7', 'Statistics', '📊'), topColor: '#43e97b', bottomColor: '#38f9d7' },
  { id: 'demo-4', name: 'Profile',  src: makeDemoSvg('#4facfe', '#00f2fe', 'Profile',    '👤'), topColor: '#4facfe', bottomColor: '#00f2fe' },
]

/* ═══════════════════════════════════════════════════════════════
   TRANSLATE HELPER — uses dictionary, falls back to original
   ═══════════════════════════════════════════════════════════════ */
function translatePhrase(text, targetLang) {
  if (!text) return text
  // Exact match
  if (PHRASE_DICT[text] && PHRASE_DICT[text][targetLang]) return PHRASE_DICT[text][targetLang]
  // Reverse lookup (if text is in a non-ko language, find ko key)
  for (const [ko, others] of Object.entries(PHRASE_DICT)) {
    if (Object.values(others).includes(text)) {
      if (targetLang === 'ko') return ko
      return others[targetLang] || text
    }
  }
  return text // fallback: return original
}

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
   BACKGROUND SHAPES — decorative elements that sit BEHIND the
   device frame. Each shape has a type + visual properties.
   ═══════════════════════════════════════════════════════════════ */
const SHAPE_TYPES = [
  { id: 'circle',         label: '● 원',              emoji: '●' },
  { id: 'ring',           label: '○ 링',              emoji: '○' },
  { id: 'soft-blob',      label: '💫 블러 원',         emoji: '💫' },
  { id: 'square',         label: '◼ 사각',            emoji: '◼' },
  { id: 'rounded-rect',   label: '▢ 라운드 사각',      emoji: '▢' },
  { id: 'triangle',       label: '▲ 삼각형',          emoji: '▲' },
  { id: 'star',           label: '★ 별',              emoji: '★' },
  { id: 'donut',          label: '◎ 도넛',            emoji: '◎' },
  { id: 'blob',           label: '🫧 유기체',          emoji: '🫧' },
  { id: 'gradient-orb',   label: '🔮 그라디언트',      emoji: '🔮' },
]

/* Helper factory for default shapes */
const makeShape = (overrides = {}) => ({
  id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  type: 'circle',
  color: '#4A55A2',
  color2: '#7C3AED',   // for gradient-orb
  size: 280,
  x: 50, y: 50,        // % of canvas
  opacity: 0.6,
  blur: 0,
  rotate: 0,
  ...overrides,
})

const BG_TEMPLATES = {
  'clean': {
    label: '🎯 Clean Solid',
    shapes: [],
  },
  'app-store-pop': {
    label: '🎨 App Store Pop',
    shapes: [
      { ...makeShape({ id: 'sp-1a', type: 'circle', color: '#4A55A2', size: 500, x: -5, y: -5, opacity: 0.55 }) },
      { ...makeShape({ id: 'sp-1b', type: 'circle', color: '#7C3AED', size: 280, x: 105, y: 90, opacity: 0.45 }) },
    ],
  },
  'center-glow': {
    label: '✨ Center Glow',
    shapes: [
      { ...makeShape({ id: 'sp-2a', type: 'soft-blob', color: '#FF6B6B', size: 600, x: 50, y: 50, opacity: 0.75, blur: 80 }) },
    ],
  },
  'diagonal': {
    label: '🌈 Diagonal',
    shapes: [
      { ...makeShape({ id: 'sp-3a', type: 'circle', color: '#06B6D4', size: 350, x: 15, y: 15, opacity: 0.5 }) },
      { ...makeShape({ id: 'sp-3b', type: 'circle', color: '#EC4899', size: 250, x: 85, y: 80, opacity: 0.55 }) },
    ],
  },
  'orbit': {
    label: '🪐 Orbit',
    shapes: [
      { ...makeShape({ id: 'sp-4a', type: 'circle', color: '#8B5CF6', size: 520, x: 50, y: 110, opacity: 0.4 }) },
      { ...makeShape({ id: 'sp-4b', type: 'circle', color: '#F59E0B', size: 140, x: 18, y: 18, opacity: 0.85 }) },
    ],
  },
  'halo': {
    label: '⚪ Halo Ring',
    shapes: [
      { ...makeShape({ id: 'sp-5a', type: 'ring', color: '#6366F1', size: 700, x: 50, y: 50, opacity: 0.5 }) },
    ],
  },
  'confetti': {
    label: '🎊 Confetti',
    shapes: [
      { ...makeShape({ id: 'sp-6a', type: 'circle', color: '#F43F5E', size: 60,  x: 10, y: 20, opacity: 0.85 }) },
      { ...makeShape({ id: 'sp-6b', type: 'circle', color: '#F59E0B', size: 40,  x: 90, y: 30, opacity: 0.85 }) },
      { ...makeShape({ id: 'sp-6c', type: 'triangle', color: '#8B5CF6', size: 70, x: 20, y: 85, opacity: 0.85 }) },
      { ...makeShape({ id: 'sp-6d', type: 'star', color: '#10B981', size: 80, x: 80, y: 75, opacity: 0.85 }) },
      { ...makeShape({ id: 'sp-6e', type: 'circle', color: '#0EA5E9', size: 30, x: 55, y: 15, opacity: 0.85 }) },
    ],
  },
  'duotone': {
    label: '🌓 Duotone',
    shapes: [
      { ...makeShape({ id: 'sp-7a', type: 'blob', color: '#3B82F6', size: 520, x: 30, y: 30, opacity: 0.7 }) },
      { ...makeShape({ id: 'sp-7b', type: 'blob', color: '#F472B6', size: 450, x: 75, y: 75, opacity: 0.7, rotate: 120 }) },
    ],
  },
  'spotlight': {
    label: '🔦 Spotlight',
    shapes: [
      { ...makeShape({ id: 'sp-8a', type: 'soft-blob', color: '#FCD34D', size: 700, x: 50, y: -20, opacity: 0.55, blur: 60 }) },
    ],
  },
  'corner-frame': {
    label: '🖼 Corner Frame',
    shapes: [
      { ...makeShape({ id: 'sp-9a', type: 'ring', color: '#0F172A', size: 140, x: 10, y: 10, opacity: 0.4 }) },
      { ...makeShape({ id: 'sp-9b', type: 'ring', color: '#0F172A', size: 140, x: 90, y: 10, opacity: 0.4 }) },
      { ...makeShape({ id: 'sp-9c', type: 'ring', color: '#0F172A', size: 140, x: 10, y: 90, opacity: 0.4 }) },
      { ...makeShape({ id: 'sp-9d', type: 'ring', color: '#0F172A', size: 140, x: 90, y: 90, opacity: 0.4 }) },
    ],
  },
  'sunrise': {
    label: '🌅 Sunrise',
    shapes: [
      { ...makeShape({ id: 'sp-10a', type: 'gradient-orb', color: '#FEC260', color2: '#F43F5E', size: 560, x: 50, y: 95, opacity: 0.95 }) },
    ],
  },
  'gradient-stack': {
    label: '🎆 Gradient Stack',
    shapes: [
      { ...makeShape({ id: 'sp-11a', type: 'gradient-orb', color: '#A855F7', color2: '#3B82F6', size: 600, x: 25, y: 35, opacity: 0.65, blur: 0 }) },
      { ...makeShape({ id: 'sp-11b', type: 'gradient-orb', color: '#F472B6', color2: '#FB923C', size: 400, x: 85, y: 80, opacity: 0.65, blur: 0 }) },
    ],
  },
  'bento-dots': {
    label: '⬜ Dot Grid',
    shapes: Array.from({ length: 20 }, (_, i) => ({
      ...makeShape({
        id: `sp-12-${i}`,
        type: 'circle',
        color: '#6366F1',
        size: 20,
        x: 10 + (i % 5) * 20,
        y: 10 + Math.floor(i / 5) * 25,
        opacity: 0.35,
      }),
    })),
  },
}

/* ═══════════════════════════════════════════════════════════════
   STORE FORMAT PRESETS — export resolution + matching device
   ═══════════════════════════════════════════════════════════════ */
const STORE_PRESETS = [
  { id: 'appstore', label: 'App Store', formats: [
    { id: 'as-ip-6.7', label: 'iPhone 6.7"', w: 1290, h: 2796, deviceId: 'iphone16-pro-max' },
    { id: 'as-ip-6.5', label: 'iPhone 6.5" ★', w: 1242, h: 2688, deviceId: 'iphone16-pro-max' },
    { id: 'as-ip-6.1', label: 'iPhone 6.1"', w: 1284, h: 2778, deviceId: 'iphone16' },
    { id: 'as-ipad-12.9', label: 'iPad 12.9"', w: 2048, h: 2732, deviceId: 'ipad-pro-13' },
    { id: 'as-ipad-13', label: 'iPad 13" ★', w: 2064, h: 2752, deviceId: 'ipad-pro-13' },
  ]},
  { id: 'playstore', label: 'Play Store', formats: [
    { id: 'ps-phone-fhd', label: 'Phone FHD ★', w: 1080, h: 1920, deviceId: 'galaxy-s25-ultra' },
    { id: 'ps-phone-qhd', label: 'Phone QHD', w: 1440, h: 2560, deviceId: 'galaxy-s25-ultra' },
    { id: 'ps-phone-max', label: 'Phone Max', w: 2160, h: 3840, deviceId: 'galaxy-s25-ultra' },
    { id: 'ps-tab-7', label: 'Tablet 7"', w: 1800, h: 2560, deviceId: 'android-tab-10' },
    { id: 'ps-tab-10', label: 'Tablet 10" ★', w: 1080, h: 1920, deviceId: 'android-tab-10' },
  ]},
]

/* ═══════════════════════════════════════════════════════════════
   IPHONE FRAME
   ═══════════════════════════════════════════════════════════════ */
/**
 * IPhoneFrame — CSS Bezel Mode
 *
 * cleanStatusBar modes:
 *   'off'   → original image as-is, no overlay
 *   'show'  → 9:41 + icons on top (NO masking; use when image has no status bar)
 *   'cover' → opaque strip covers original + 9:41 + icons (hides simulator UI)
 *
 * Dynamic Island is ALWAYS z:60 — nothing shows through it.
 * Screen uses explicit width/height px for perfect preview/export parity.
 */
function IPhoneFrame({ src, device, shadow, scale = 1, frameColor, topColor, topIsLight, coverColor, cleanStatusBar = 'off' }) {
  const w = device.frameWidth * scale
  const bezel = device.bezel * scale
  const rOuter = device.frameRadius * scale
  const rInner = rOuter - bezel
  const screenInnerW = w - 2 * bezel
  const screenInnerH = screenInnerW * (device.screenH / device.screenW)
  const screenScale = screenInnerW / device.screenW
  const fc = frameColor || FRAME_COLORS[0]

  const islandW = (device.islandW || 125) * screenScale
  const islandH = (device.islandH || 37) * screenScale
  const islandTop = (device.islandTop || 11) * screenScale
  const statusBarH = (device.statusBarH || 0) * screenScale
  const maskBg = coverColor || topColor || "#000000"
  const iconColor = isLightColor(maskBg) ? '#000000' : '#ffffff'
  const edgePad = 24 * screenScale
  const iconH = Math.max(7, 11 * screenScale)
  const showBar = cleanStatusBar === 'show' || cleanStatusBar === 'cover'
  const maskOn = cleanStatusBar === 'cover'

  return (
    <div style={{ position: 'relative', width: w }}>
      {/* Side buttons */}
      <div style={{ position: 'absolute', left: -2.5 * scale, top: 68 * scale, width: 2.5 * scale, height: 16 * scale, borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`, background: fc.btn }} />
      <div style={{ position: 'absolute', left: -2.5 * scale, top: 100 * scale, width: 2.5 * scale, height: 28 * scale, borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`, background: fc.btn }} />
      <div style={{ position: 'absolute', left: -2.5 * scale, top: 136 * scale, width: 2.5 * scale, height: 28 * scale, borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`, background: fc.btn }} />
      <div style={{ position: 'absolute', right: -2.5 * scale, top: 108 * scale, width: 2.5 * scale, height: 48 * scale, borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`, background: fc.btn }} />

      {/* Outer bezel — overflow:hidden + rOuter clips inner children to rounded phone shape */}
      <div style={{
        width: w, padding: bezel,
        borderRadius: rOuter, overflow: 'hidden',
        background: fc.body, boxShadow: shadow,
        position: 'relative', boxSizing: 'border-box',
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: rOuter, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.12)', pointerEvents: 'none', zIndex: 5 }} />

        {/* Inner screen — explicit w/h, overflow:hidden + rInner = perfect corner clipping */}
        <div style={{
          width: screenInnerW, height: screenInnerH,
          borderRadius: rInner, overflow: 'hidden',
          background: '#000', position: 'relative',
          boxShadow: `inset 0 0 0 ${0.5 * scale}px rgba(0,0,0,0.3)`,
        }}>
          {/* Screenshot — child of screen, clipped by parent rounded corners */}
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'top center',
              display: 'block',
            }}
          />

          {/* Cover strip — opaque mask over original status bar (only in 'cover' mode) */}
          {maskOn && device.statusBarH && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: statusBarH, background: maskBg, zIndex: 50,
            }} />
          )}

          {/* Clean status bar text + icons (visible in both 'show' and 'cover' modes) */}
          {showBar && device.statusBarH && (
            <>
              <span style={{
                position: 'absolute', left: edgePad,
                top: islandTop + islandH / 2, transform: 'translateY(-50%)',
                color: iconColor, fontSize: Math.max(8, 15 * screenScale),
                fontWeight: 700, letterSpacing: -0.3, lineHeight: 1,
                fontFamily: '-apple-system, "SF Pro Display", system-ui',
                zIndex: 55, pointerEvents: 'none',
              }}>9:41</span>
              <div style={{
                position: 'absolute', right: edgePad,
                top: islandTop + islandH / 2, transform: 'translateY(-50%)',
                zIndex: 55, pointerEvents: 'none',
              }}>
                <StatusBarIcons color={iconColor} h={iconH} scale={screenScale} />
              </div>
            </>
          )}

          {/* Dynamic Island — ALWAYS on top (z:60), nothing shows through */}
          <div style={{
            position: 'absolute', top: islandTop, left: '50%',
            transform: 'translateX(-50%)', zIndex: 60,
          }}>
            <div style={{ background: fc.island, borderRadius: 999, width: islandW, height: islandH }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SAMSUNG FRAME
   ═══════════════════════════════════════════════════════════════ */
function SamsungFrame({ src, device, shadow, scale = 1, frameColor, topColor, topIsLight, coverColor, cleanStatusBar = 'off' }) {
  const w = device.frameWidth * scale
  const bezel = device.bezel * scale
  const rOuter = device.frameRadius * scale
  const rInner = rOuter - bezel
  const screenInnerW = w - 2 * bezel
  const screenInnerH = screenInnerW * (device.screenH / device.screenW)
  const screenScale = screenInnerW / device.screenW
  const fc = frameColor || FRAME_COLORS[1]
  const statusBarH = (device.statusBarH || 0) * screenScale
  const maskBg = coverColor || topColor || "#000000"
  const iconColor = isLightColor(maskBg) ? '#000000' : '#ffffff'
  const edgePad = 24 * screenScale
  const iconH = Math.max(7, 11 * screenScale)
  const showBar = cleanStatusBar === 'show' || cleanStatusBar === 'cover'
  const maskOn = cleanStatusBar === 'cover'

  return (
    <div style={{ position: 'relative', width: w }}>
      <div style={{ position: 'absolute', right: -2.5 * scale, top: 82 * scale, width: 2.5 * scale, height: 36 * scale, borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`, background: fc.btn }} />
      <div style={{ position: 'absolute', right: -2.5 * scale, top: 128 * scale, width: 2.5 * scale, height: 24 * scale, borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`, background: fc.btn }} />
      <div style={{ position: 'absolute', right: -2.5 * scale, top: 158 * scale, width: 2.5 * scale, height: 24 * scale, borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`, background: fc.btn }} />

      <div style={{
        width: w, padding: bezel,
        borderRadius: rOuter, overflow: 'hidden',
        background: fc.body, boxShadow: shadow,
        position: 'relative', boxSizing: 'border-box',
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: rOuter, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)', pointerEvents: 'none', zIndex: 5 }} />

        <div style={{
          width: screenInnerW, height: screenInnerH,
          borderRadius: rInner, overflow: 'hidden',
          background: '#000', position: 'relative',
          boxShadow: `inset 0 0 0 ${0.5 * scale}px rgba(0,0,0,0.3)`,
        }}>
          <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />

          {maskOn && device.statusBarH && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: statusBarH, background: maskBg, zIndex: 50 }} />
          )}
          {showBar && device.statusBarH && (
            <>
              <span style={{
                position: 'absolute', left: edgePad, top: statusBarH / 2, transform: 'translateY(-50%)',
                color: iconColor, fontSize: Math.max(8, 15 * screenScale), fontWeight: 700, letterSpacing: -0.3, lineHeight: 1,
                fontFamily: '-apple-system, "SF Pro Display", system-ui', zIndex: 55, pointerEvents: 'none',
              }}>9:41</span>
              <div style={{ position: 'absolute', right: edgePad, top: statusBarH / 2, transform: 'translateY(-50%)', zIndex: 55, pointerEvents: 'none' }}>
                <StatusBarIcons color={iconColor} h={iconH} scale={screenScale} />
              </div>
            </>
          )}

          {/* Punch-hole camera — z:60 */}
          <div style={{ position: 'absolute', top: 10 * scale, left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}>
            <div style={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', background: '#0a0a0a', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.08)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   IPAD FRAME
   ═══════════════════════════════════════════════════════════════ */
function IPadFrame({ src, device, shadow, scale = 1, frameColor, topColor, topIsLight, coverColor, cleanStatusBar = 'off' }) {
  const w = device.frameWidth * scale
  const bezel = device.bezel * scale
  const rOuter = device.frameRadius * scale
  const rInner = rOuter - bezel
  const screenInnerW = w - 2 * bezel
  const screenInnerH = screenInnerW * (device.screenH / device.screenW)
  const screenScale = screenInnerW / device.screenW
  const fc = frameColor || FRAME_COLORS[0]
  const statusBarH = (device.statusBarH || 0) * screenScale
  const maskBg = coverColor || topColor || "#000000"
  const iconColor = isLightColor(maskBg) ? '#000000' : '#ffffff'
  const edgePad = 24 * screenScale
  const iconH = Math.max(7, 11 * screenScale)
  const showBar = cleanStatusBar === 'show' || cleanStatusBar === 'cover'
  const maskOn = cleanStatusBar === 'cover'

  return (
    <div style={{
      width: w, padding: bezel,
      borderRadius: rOuter, overflow: 'hidden',
      background: fc.body, boxShadow: shadow,
      position: 'relative', boxSizing: 'border-box',
    }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: rOuter, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 5 }} />
      <div style={{
        width: screenInnerW, height: screenInnerH,
        borderRadius: rInner, overflow: 'hidden',
        background: '#000', position: 'relative',
        boxShadow: `inset 0 0 0 ${0.5 * scale}px rgba(0,0,0,0.2)`,
      }}>
        <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
        {maskOn && device.statusBarH && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: statusBarH, background: maskBg, zIndex: 50 }} />
        )}
        {showBar && device.statusBarH && (
          <>
            <span style={{
              position: 'absolute', left: edgePad, top: statusBarH / 2, transform: 'translateY(-50%)',
              color: iconColor, fontSize: Math.max(8, 15 * screenScale), fontWeight: 700, letterSpacing: -0.3, lineHeight: 1,
              fontFamily: '-apple-system, "SF Pro Display", system-ui', zIndex: 55, pointerEvents: 'none',
            }}>9:41</span>
            <div style={{ position: 'absolute', right: edgePad, top: statusBarH / 2, transform: 'translateY(-50%)', zIndex: 55, pointerEvents: 'none' }}>
              <StatusBarIcons color={iconColor} h={iconH} scale={screenScale} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANDROID TABLET FRAME
   ═══════════════════════════════════════════════════════════════ */
function AndroidTabFrame({ src, device, shadow, scale = 1, frameColor, topColor, topIsLight, coverColor, cleanStatusBar = 'off' }) {
  const w = device.frameWidth * scale
  const bezel = device.bezel * scale
  const rOuter = device.frameRadius * scale
  const rInner = rOuter - bezel
  const screenInnerW = w - 2 * bezel
  const screenInnerH = screenInnerW * (device.screenH / device.screenW)
  const screenScale = screenInnerW / device.screenW
  const fc = frameColor || FRAME_COLORS[1]
  const statusBarH = (device.statusBarH || 0) * screenScale
  const maskBg = coverColor || topColor || "#000000"
  const iconColor = isLightColor(maskBg) ? '#000000' : '#ffffff'
  const edgePad = 24 * screenScale
  const iconH = Math.max(7, 11 * screenScale)
  const showBar = cleanStatusBar === 'show' || cleanStatusBar === 'cover'
  const maskOn = cleanStatusBar === 'cover'

  return (
    <div style={{
      width: w, padding: bezel,
      borderRadius: rOuter, overflow: 'hidden',
      background: fc.body, boxShadow: shadow,
      position: 'relative', boxSizing: 'border-box',
    }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: rOuter, boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.15), inset 0 -0.5px 0 rgba(0,0,0,0.15)', pointerEvents: 'none', zIndex: 5 }} />
      <div style={{
        width: screenInnerW, height: screenInnerH,
        borderRadius: rInner, overflow: 'hidden',
        background: '#000', position: 'relative',
        boxShadow: `inset 0 0 0 ${0.5 * scale}px rgba(0,0,0,0.2)`,
      }}>
        <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
        {maskOn && device.statusBarH && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: statusBarH, background: maskBg, zIndex: 50 }} />
        )}
        {showBar && device.statusBarH && (
          <>
            <span style={{
              position: 'absolute', left: edgePad, top: statusBarH / 2, transform: 'translateY(-50%)',
              color: iconColor, fontSize: Math.max(8, 15 * screenScale), fontWeight: 700, letterSpacing: -0.3, lineHeight: 1,
              fontFamily: '-apple-system, "SF Pro Display", system-ui', zIndex: 55, pointerEvents: 'none',
            }}>9:41</span>
            <div style={{ position: 'absolute', right: edgePad, top: statusBarH / 2, transform: 'translateY(-50%)', zIndex: 55, pointerEvents: 'none' }}>
              <StatusBarIcons color={iconColor} h={iconH} scale={screenScale} />
            </div>
          </>
        )}
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
function DeviceFrame({ src, device, shadow, scale = 1, frameColor, topColor, topIsLight, bottomColor, coverColor, cleanStatusBar }) {
  const p = { src, device, shadow, scale, frameColor, topColor, topIsLight, bottomColor, coverColor, cleanStatusBar }
  switch (device.type) {
    case 'iphone': return <IPhoneFrame {...p} />
    case 'samsung': return <SamsungFrame {...p} />
    case 'ipad': return <IPadFrame {...p} />
    case 'android-tab': return <AndroidTabFrame {...p} />
    case 'browser': return <BrowserFrame src={src} device={device} shadow={shadow} scale={scale} />
    case 'glass': return <GlassFrame src={src} device={device} shadow={shadow} scale={scale} />
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
function SimpleMockupCard({ src, device, bg, padding, shadow, cardRef, scale = 1, frameColor, topColor, topIsLight, bottomColor, coverColor, cleanStatusBar, backgroundShapes = [], selectedShapeIds = [], onSelectShape, onMoveShape, onResizeShape, interactiveShapes = false }) {
  const bgStyle = bg.isTransparent ? { background: 'transparent' } : bg.value.includes('gradient') ? { background: bg.value } : { backgroundColor: bg.value }
  return (
    <div ref={cardRef} style={{ ...bgStyle, padding: padding * scale, borderRadius: 16 * scale, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      {/* Background shapes — behind device, clipped by card borderRadius */}
      {backgroundShapes.length > 0 && (
        <BackgroundCanvas
          shapes={backgroundShapes}
          selectedIds={selectedShapeIds}
          onSelect={onSelectShape}
          onShapeMove={onMoveShape} onShapeResize={onResizeShape}
          interactive={interactiveShapes}
          canvasScale={scale}
          borderRadius={16 * scale}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <DeviceFrame src={src} device={device} shadow={shadow.value} scale={scale} frameColor={frameColor} topColor={topColor} topIsLight={topIsLight} bottomColor={bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBar} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   APP STORE MOCKUP CARD  (Tab 2) — 9:19.5 fixed canvas
   ═══════════════════════════════════════════════════════════════ */
function AppStoreMockupCard({ src, device, bgColor, title, subtitle, shadow, cardRef, scale = 1, frameColor, textColor: customTextColor, titleSize = 18, subSize = 11, textTop = 22, gap = 0, exportW, exportH, fontFamily, subTextColor, topColor, topIsLight, bottomColor, coverColor, cleanStatusBar, backgroundShapes = [], selectedShapeIds = [], onSelectShape, onMoveShape, onResizeShape, interactiveShapes = false }) {
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
      {/* Background shapes — decorative layer behind everything */}
      {backgroundShapes.length > 0 && (
        <BackgroundCanvas
          shapes={backgroundShapes}
          selectedIds={selectedShapeIds}
          onSelect={onSelectShape}
          onShapeMove={onMoveShape} onShapeResize={onResizeShape}
          interactive={interactiveShapes}
          canvasScale={scale}
          borderRadius={16 * scale}
        />
      )}

      {/* Text area */}
      <div style={{
        flex: `0 0 ${textTop}%`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${16 * scale}px ${22 * scale}px ${4 * scale}px`,
        textAlign: 'center',
        position: 'relative', zIndex: 1,
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
        zIndex: 1,
      }}>
        <DeviceFrame src={src} device={device} shadow={shadow.value} scale={deviceScale} frameColor={frameColor} topColor={topColor} topIsLight={topIsLight} bottomColor={bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBar} />
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
  const canvasW = (orientation === 'landscape' ? 620 : 320) * scale
  const canvasH = canvasW * (baseH / baseW)
  const isTransparentBg = bgColor === 'transparent'
  const autoTextColor = isTransparentBg || isLightColor(bgColor) ? '#111' : '#fff'
  const textColor = customTextColor || autoTextColor
  const subColor = subTextColor || (isTransparentBg || isLightColor(bgColor) ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)')
  const phoneSc = scale * (canvasH * 0.82) / (device.frameWidth * 2.2)
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
          left: isLand ? `${(28 + textOffsetX) * scale}px` : `calc(50% + ${textOffsetX * scale}px)`,
          top: isLand ? `calc(50% + ${textOffsetY * scale}px)` : `${(16 + textOffsetY) * scale}px`,
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
   CANVAS SAMPLERS — top-left + center-bottom patch colors
   Top sample drives status-bar eraser color; bottom sample drives
   the seamless bottom fill on the ScreenMask container.
   ═══════════════════════════════════════════════════════════════ */
function sampleImageTop(imgSrc) {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const stripH = Math.max(1, Math.round(img.naturalHeight * 0.05))
        const c = document.createElement('canvas')
        c.width = img.naturalWidth; c.height = stripH
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, c.width, c.height)
        const px = Math.min(10, c.width - 1)
        const py = Math.min(10, c.height - 1)
        const pw = Math.min(20, c.width - px)
        const ph = Math.min(20, c.height - py)
        const data = ctx.getImageData(px, py, pw, ph).data
        let r = 0, g = 0, b = 0, n = 0
        for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; n++ }
        r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n)
        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
        const isLight = (r * 299 + g * 587 + b * 114) / 1000 > 140
        resolve({ color: hex, isLight })
      }
      img.onerror = () => resolve({ color: '#ffffff', isLight: true })
      img.src = imgSrc
    } catch { resolve({ color: '#ffffff', isLight: true }) }
  })
}

function sampleImageBottom(imgSrc) {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const stripH = Math.max(1, Math.round(img.naturalHeight * 0.05))
        const c = document.createElement('canvas')
        c.width = img.naturalWidth; c.height = stripH
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, img.naturalHeight - stripH, img.naturalWidth, stripH, 0, 0, c.width, stripH)
        const pw = Math.min(20, c.width)
        const ph = Math.min(20, c.height)
        const px = Math.max(0, Math.floor((c.width - pw) / 2))
        const py = Math.max(0, c.height - ph)
        const data = ctx.getImageData(px, py, pw, ph).data
        let r = 0, g = 0, b = 0, n = 0
        for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; n++ }
        r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n)
        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
        resolve({ color: hex })
      }
      img.onerror = () => resolve({ color: '#000000' })
      img.src = imgSrc
    } catch { resolve({ color: '#000000' }) }
  })
}

/* ═══════════════════════════════════════════════════════════════
   STANDARD STATUS BAR — "9:41" + signal / wifi / battery (SVG)
   Two layouts:
     • hasIsland: split eraser (left + right boxes, island in the gap)
     • full-width: single opaque strip
   All positioning is absolute to the PARENT container (which should
   be positioned + sized to match the screen area).
   ═══════════════════════════════════════════════════════════════ */
function StandardStatusBar({ device, screenScale, maskBg, isDark = false }) {
  const baseScale = screenScale
  const statusBarH = (device.statusBarH || 44) * baseScale
  const color = isDark ? '#ffffff' : '#000000'
  const fontSize = Math.max(8, 15 * baseScale)
  const iconH = Math.max(7, 11 * baseScale)
  const edgePad = 24 * baseScale

  if (device.hasIsland) {
    const islandW = (device.islandW || 125) * baseScale
    const islandTop = (device.islandTop || 11) * baseScale
    const islandH = (device.islandH || 37) * baseScale
    const islandCenterY = islandTop + islandH / 2
    const halfIsland = islandW / 2 + 6 * baseScale
    return (
      <>
        <div style={{ position: 'absolute', top: 0, left: 0, width: `calc(50% - ${halfIsland}px)`, height: statusBarH, background: maskBg, zIndex: 11 }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: `calc(50% - ${halfIsland}px)`, height: statusBarH, background: maskBg, zIndex: 11 }} />
        <span style={{
          position: 'absolute', left: edgePad, top: islandCenterY, transform: 'translateY(-50%)',
          color, fontSize, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1,
          fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, system-ui, sans-serif',
          zIndex: 12, pointerEvents: 'none',
        }}>9:41</span>
        <div style={{ position: 'absolute', right: edgePad, top: islandCenterY, transform: 'translateY(-50%)', zIndex: 12, pointerEvents: 'none' }}>
          <StatusBarIcons color={color} h={iconH} scale={baseScale} />
        </div>
      </>
    )
  }

  // No-island layout: single opaque strip
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: statusBarH, background: maskBg, zIndex: 11 }} />
      <span style={{
        position: 'absolute', left: edgePad, top: statusBarH / 2, transform: 'translateY(-50%)',
        color, fontSize, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1,
        fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, system-ui, sans-serif',
        zIndex: 12, pointerEvents: 'none',
      }}>9:41</span>
      <div style={{ position: 'absolute', right: edgePad, top: statusBarH / 2, transform: 'translateY(-50%)', zIndex: 12, pointerEvents: 'none' }}>
        <StatusBarIcons color={color} h={iconH} scale={baseScale} />
      </div>
    </>
  )
}

function StatusBarIcons({ color, h, scale }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 * scale }}>
      {/* Signal bars */}
      <svg width={h * 1.5} height={h} viewBox="0 0 17 12" fill={color}>
        <rect x="0" y="8" width="3" height="4" rx="0.8" />
        <rect x="4.5" y="6" width="3" height="6" rx="0.8" />
        <rect x="9" y="3" width="3" height="9" rx="0.8" />
        <rect x="13.5" y="0" width="3" height="12" rx="0.8" />
      </svg>
      {/* WiFi */}
      <svg width={h * 1.4} height={h} viewBox="0 0 15 11" fill={color}>
        <path d="M7.5 2c2.5 0 4.9 0.93 6.8 2.5l-1.1 1.3C11.6 4.5 9.6 3.8 7.5 3.8S3.4 4.5 1.8 5.8L0.7 4.5C2.6 2.9 5 2 7.5 2zm0 3c1.7 0 3.3 0.6 4.5 1.7l-1.1 1.3C10 7.2 8.8 6.8 7.5 6.8S5 7.2 4.1 8l-1.1-1.3C4.2 5.6 5.8 5 7.5 5zm0 3c0.85 0 1.65 0.3 2.3 0.83l-1.1 1.3c-0.35-0.28-0.78-0.43-1.2-0.43s-0.85 0.15-1.2 0.43l-1.1-1.3C5.85 8.3 6.65 8 7.5 8z" />
      </svg>
      {/* Battery (100%) */}
      <svg width={h * 2.2} height={h} viewBox="0 0 26 12" fill="none">
        <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke={color} strokeOpacity="0.5" strokeWidth="1" fill="none" />
        <rect x="23" y="3.5" width="1.5" height="5" rx="0.5" fill={color} fillOpacity="0.5" />
        <rect x="2" y="2" width="19" height="8" rx="1.6" fill={color} />
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SHAPE RENDERER — draws a single shape with correct geometry
   (used inside BackgroundCanvas).
   ═══════════════════════════════════════════════════════════════ */
/**
 * PreviewScaler — wraps a fixed-pixel card in a container that visually
 * scales it via CSS transform. The card itself stays at its natural pixel
 * dimensions (scale=1), so its DOM is IDENTICAL whether it's shown as a
 * thumbnail or captured by html-to-image for export.
 *
 * Props:
 *   width  — full pixel width of the child card (the "export" width)
 *   height — full pixel height of the child card
 *   scale  — visual scale factor (e.g. 0.55 for thumbnail)
 *   className, style — forwarded to the OUTER clipping div
 *   onClick — attached to the outer div
 */
function PreviewScaler({ width, height, scale = 1, className, style, onClick, children }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        width: width * scale,
        height: height * scale,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <div style={{
        width, height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}>
        {children}
      </div>
    </div>
  )
}

/**
 * AutoFitScaler — like PreviewScaler but computes the scale automatically so
 * the fixed-pixel card fits the available viewport (maxVh vertically, parent
 * width horizontally). Uses ResizeObserver to reflow on viewport change.
 */
function AutoFitScaler({ cardW, cardH, maxVh = 55, className, style, children }) {
  const outerRef = useRef(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const fit = () => {
      const availW = el.clientWidth || 600
      const availH = Math.min(window.innerHeight * (maxVh / 100), 900)
      const s = Math.min(availW / cardW, availH / cardH, 1)
      setScale(Math.max(0.1, s))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    window.addEventListener('resize', fit)
    return () => { ro.disconnect(); window.removeEventListener('resize', fit) }
  }, [cardW, cardH, maxVh])

  return (
    <div ref={outerRef} className={className} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <div style={{
        width: cardW * scale, height: cardH * scale,
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          width: cardW, height: cardH,
          transform: `scale(${scale})`, transformOrigin: 'top left',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function Shape({ s, selected, onMouseDown, onClick, onResizeStart, canvasScale = 1 }) {
  const sz = s.size * canvasScale
  const isLocked = s.locked
  const commonStyle = {
    position: 'absolute',
    top: `${s.y}%`, left: `${s.x}%`,
    width: sz, height: sz,
    transform: `translate(-50%, -50%) rotate(${s.rotate || 0}deg)`,
    opacity: s.opacity,
    filter: s.blur ? `blur(${s.blur * canvasScale}px)` : undefined,
    cursor: onMouseDown ? (isLocked ? 'not-allowed' : 'move') : 'default',
    outline: selected ? `2px dashed ${isLocked ? 'rgb(244,63,94)' : 'rgb(139,92,246)'}` : 'none',
    outlineOffset: 4 * canvasScale,
    pointerEvents: onMouseDown ? 'auto' : 'none',
  }
  const onDownStop = (e) => {
    if (isLocked) { e.stopPropagation(); return }
    e.stopPropagation()
    onMouseDown && onMouseDown(e, s.id)
  }
  const onClickStop = (e) => { e.stopPropagation(); onClick && onClick(s.id, e) }

  switch (s.type) {
    case 'ring':
      return (
        <div onMouseDown={onDownStop} onClick={onClickStop} style={{
          ...commonStyle,
          borderRadius: '50%',
          border: `${Math.max(4, sz * 0.06)}px solid ${s.color}`,
          boxSizing: 'border-box',
        }} />
      )
    case 'donut':
      return (
        <div onMouseDown={onDownStop} onClick={onClickStop} style={{
          ...commonStyle,
          borderRadius: '50%',
          background: s.color,
          WebkitMask: `radial-gradient(circle, transparent ${sz * 0.3}px, black ${sz * 0.31}px)`,
          mask: `radial-gradient(circle, transparent ${sz * 0.3}px, black ${sz * 0.31}px)`,
        }} />
      )
    case 'soft-blob':
      return (
        <div onMouseDown={onDownStop} onClick={onClickStop} style={{
          ...commonStyle,
          borderRadius: '50%',
          background: s.color,
        }} />
      )
    case 'square':
      return (
        <div onMouseDown={onDownStop} onClick={onClickStop} style={{
          ...commonStyle,
          background: s.color,
        }} />
      )
    case 'rounded-rect':
      return (
        <div onMouseDown={onDownStop} onClick={onClickStop} style={{
          ...commonStyle,
          background: s.color,
          borderRadius: sz * 0.18,
        }} />
      )
    case 'triangle': {
      const pts = `${sz/2},0 ${sz},${sz} 0,${sz}`
      return (
        <svg onMouseDown={onDownStop} onClick={onClickStop} width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={commonStyle}>
          <polygon points={pts} fill={s.color} />
        </svg>
      )
    }
    case 'star': {
      const cx = sz / 2, cy = sz / 2, rO = sz / 2, rI = sz * 0.22
      const pts = []
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2
        const r = i % 2 === 0 ? rO : rI
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
      }
      return (
        <svg onMouseDown={onDownStop} onClick={onClickStop} width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={commonStyle}>
          <polygon points={pts.join(' ')} fill={s.color} />
        </svg>
      )
    }
    case 'blob': {
      // Organic SVG path
      return (
        <svg onMouseDown={onDownStop} onClick={onClickStop} width={sz} height={sz} viewBox="0 0 200 200" style={commonStyle}>
          <path d="M44.5,-58.4C55.3,-45.5,60.1,-29.4,63.4,-13.1C66.7,3.2,68.5,19.7,61.7,31.6C54.9,43.5,39.5,50.9,24.1,56.1C8.7,61.3,-6.7,64.4,-22.4,61.3C-38.1,58.1,-54,48.7,-61.6,34.5C-69.2,20.3,-68.5,1.3,-63.8,-15.1C-59.1,-31.5,-50.4,-45.3,-38.4,-57.8C-26.4,-70.3,-13.2,-81.5,1.6,-83.5C16.4,-85.5,32.8,-78.3,44.5,-58.4Z" transform="translate(100 100)" fill={s.color} />
        </svg>
      )
    }
    case 'gradient-orb':
      return (
        <div onMouseDown={onDownStop} onClick={onClickStop} style={{
          ...commonStyle,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${s.color}, ${s.color2 || s.color})`,
        }} />
      )
    case 'image':
      return (
        <div onMouseDown={onDownStop} onClick={onClickStop} style={commonStyle}>
          <img src={s.imageSrc} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }} />
        </div>
      )
    case 'circle':
    default:
      return (
        <div onMouseDown={onDownStop} onClick={onClickStop} style={{
          ...commonStyle,
          borderRadius: '50%',
          background: s.color,
        }} />
      )
  }
}

/* Resize handles overlay — shown on selected shape in interactive mode */
function ResizeHandles({ s, canvasScale, onResizeStart, locked }) {
  if (locked) return null
  const sz = s.size * canvasScale
  const handleSize = 10
  const handles = [
    { key: 'tl', x: -sz/2 - handleSize/2, y: -sz/2 - handleSize/2, cursor: 'nwse-resize', corner: 'tl' },
    { key: 'tr', x:  sz/2 - handleSize/2, y: -sz/2 - handleSize/2, cursor: 'nesw-resize', corner: 'tr' },
    { key: 'bl', x: -sz/2 - handleSize/2, y:  sz/2 - handleSize/2, cursor: 'nesw-resize', corner: 'bl' },
    { key: 'br', x:  sz/2 - handleSize/2, y:  sz/2 - handleSize/2, cursor: 'nwse-resize', corner: 'br' },
  ]
  return (
    <div style={{
      position: 'absolute',
      top: `${s.y}%`, left: `${s.x}%`,
      width: 0, height: 0,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      {handles.map(h => (
        <div
          key={h.key}
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, h.corner) }}
          style={{
            position: 'absolute',
            width: handleSize, height: handleSize,
            left: h.x, top: h.y,
            background: 'white',
            border: '2px solid rgb(139,92,246)',
            borderRadius: 2,
            cursor: h.cursor,
            pointerEvents: 'auto',
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BACKGROUND CANVAS — overflow-clipped container for shapes.
   Supports drag-to-move, multi-select (H), snap-to-grid (J),
   smart guide lines, and resize handles (G).
   ═══════════════════════════════════════════════════════════════ */
function BackgroundCanvas({ shapes = [], bgColor, selectedIds = [], onSelect, onShapeMove, onShapeResize, canvasScale = 1, interactive = false, borderRadius = 0, snapEnabled = true }) {
  const canvasRef = useRef(null)
  const [guides, setGuides] = useState({ vx: null, hy: null })  // smart guide lines (in %)

  // Drag move handler — supports multi-select (group move) + snap + guides
  const handleMouseDown = (e, id) => {
    if (!interactive || !canvasRef.current) return
    const shape = shapes.find(s => s.id === id)
    if (!shape || shape.locked) return

    // If clicked shape isn't part of current selection, select ONLY this one
    const ids = selectedIds.includes(id) ? selectedIds : [id]
    if (!selectedIds.includes(id)) onSelect && onSelect(id, e)

    const rect = canvasRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const starts = {}
    ids.forEach(i => {
      const s = shapes.find(sh => sh.id === i)
      if (s) starts[i] = { x: s.x, y: s.y }
    })

    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      const dxPct = (dx / rect.width) * 100
      const dyPct = (dy / rect.height) * 100

      ids.forEach(i => {
        const st = starts[i]
        if (!st) return
        let newX = st.x + dxPct
        let newY = st.y + dyPct

        // MAGNETIC SNAP — Toss-style, 6px threshold in actual pixels (scale-invariant)
        if (snapEnabled) {
          const thresholdX = 6 / rect.width * 100   // 6px as % of canvas width
          const thresholdY = 6 / rect.height * 100  // 6px as % of canvas height
          let vx = null, hy = null

          // Priority 1: Canvas center (50%) — the "magnetic center"
          if (Math.abs(newX - 50) < thresholdX) { newX = 50; vx = 50 }
          if (Math.abs(newY - 50) < thresholdY) { newY = 50; hy = 50 }

          // Priority 2: Canvas edges (0%, 100%)
          for (const edge of [0, 100]) {
            if (vx == null && Math.abs(newX - edge) < thresholdX) { newX = edge; vx = edge }
            if (hy == null && Math.abs(newY - edge) < thresholdY) { newY = edge; hy = edge }
          }

          // Priority 3: Other shape centers (alignment guides)
          for (const other of shapes) {
            if (other.id === i) continue
            if (vx == null && Math.abs(newX - other.x) < thresholdX) { newX = other.x; vx = other.x }
            if (hy == null && Math.abs(newY - other.y) < thresholdY) { newY = other.y; hy = other.y }
          }

          // Update guide lines — only for single-shape drag
          if (ids.length === 1) setGuides({ vx, hy })
        }

        onShapeMove && onShapeMove(i, { x: newX, y: newY })
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setGuides({ vx: null, hy: null })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // G: Resize handler
  const handleResizeStart = (e, id, corner) => {
    if (!interactive || !canvasRef.current) return
    const shape = shapes.find(s => s.id === id)
    if (!shape || shape.locked) return
    const rect = canvasRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const startSize = shape.size

    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      // Use diagonal distance for simplicity
      const diag = corner.includes('r') ? dx : -dx
      const diagY = corner.includes('b') ? dy : -dy
      const delta = Math.max(diag, diagY) / canvasScale
      const newSize = Math.max(20, Math.min(800, startSize + delta))
      onShapeResize && onShapeResize(id, { size: newSize })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Shape click — H: Shift+click adds/removes from selection, plain click = single
  const handleShapeClick = (id, e) => {
    if (!onSelect) return
    if (e && e.shiftKey) onSelect(id, e)  // caller handles toggle
    else onSelect(id, e)
  }

  return (
    <div
      ref={canvasRef}
      data-bg-canvas
      onClick={() => interactive && onSelect && onSelect(null)}
      style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden',
        borderRadius,
        background: bgColor || undefined,
        zIndex: 0,
      }}
    >
      {shapes.map(s => (
        <Shape
          key={s.id}
          s={s}
          selected={interactive && selectedIds.includes(s.id)}
          canvasScale={canvasScale}
          onMouseDown={interactive ? handleMouseDown : undefined}
          onClick={interactive ? handleShapeClick : undefined}
        />
      ))}

      {/* G: Resize handles for single selection */}
      {interactive && selectedIds.length === 1 && (() => {
        const s = shapes.find(sh => sh.id === selectedIds[0])
        if (!s) return null
        return <ResizeHandles s={s} canvasScale={canvasScale} locked={s.locked} onResizeStart={(e, corner) => handleResizeStart(e, s.id, corner)} />
      })()}

      {/* Magnetic snap guide lines — Toss Blue with glow */}
      {interactive && guides.vx != null && (
        <div className="snap-guide" style={{ position: 'absolute', top: 0, bottom: 0, left: `${guides.vx}%`, width: 1, pointerEvents: 'none', zIndex: 9998 }} />
      )}
      {interactive && guides.hy != null && (
        <div className="snap-guide" style={{ position: 'absolute', left: 0, right: 0, top: `${guides.hy}%`, height: 1, pointerEvents: 'none', zIndex: 9998 }} />
      )}
    </div>
  )
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
  // Per-device Clean Status Bar toggle: { [deviceId]: boolean }
  const [cleanStatusBarMap, setCleanStatusBarMap] = useState({})
  // cleanStatusBarMode per device: 'off' | 'show' | 'cover'
  const cleanStatusBarMode = cleanStatusBarMap[device.id] || 'off'
  const setCleanStatusBarMode = (mode) => setCleanStatusBarMap(prev => ({ ...prev, [device.id]: mode }))
  // coverColor per device: null = auto (sample from image), else a hex like '#ffffff'
  const [coverColorMap, setCoverColorMap] = useState({})
  const coverColor = coverColorMap[device.id] || null
  const setCoverColor = (color) => setCoverColorMap(prev => ({ ...prev, [device.id]: color }))

  // Background shapes — decorative elements BEHIND the device frame
  const [backgroundShapes, setBackgroundShapes] = useState([])
  // Multi-select (H): Set of shape IDs. selectedShapeId = single (H's first)
  const [selectedShapeIds, setSelectedShapeIds] = useState([])
  const selectedShapeId = selectedShapeIds[0] || null
  const selectedShape = backgroundShapes.find(s => s.id === selectedShapeId)
  const setSelectedShapeIdSingle = (id) => setSelectedShapeIds(id ? [id] : [])

  // Shape CRUD helpers
  const updateShape = (id, updates) => setBackgroundShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  const updateMany = (ids, fn) => setBackgroundShapes(prev => prev.map(s => ids.includes(s.id) ? { ...s, ...fn(s) } : s))
  const moveShape = (id, { x, y }) => updateShape(id, { x, y })
  const addShape = (type = 'circle') => {
    const s = makeShape({ type, x: 50, y: 50, size: 240 })
    setBackgroundShapes(prev => [...prev, s])
    setSelectedShapeIds([s.id])
  }
  const removeShape = (id) => {
    setBackgroundShapes(prev => prev.filter(s => s.id !== id))
    setSelectedShapeIds(prev => prev.filter(x => x !== id))
  }
  const applyBgTemplate = (tplId) => {
    const tpl = BG_TEMPLATES[tplId] || userTemplates.find(t => t.id === tplId)
    if (!tpl) return
    setBackgroundShapes(tpl.shapes.map(s => ({ ...s, id: `bg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })))
    setSelectedShapeIds([])
  }

  // B: Duplicate
  const duplicateShape = (id) => {
    const orig = backgroundShapes.find(s => s.id === id)
    if (!orig) return
    const clone = makeShape({ ...orig, x: Math.min(150, orig.x + 5), y: Math.min(150, orig.y + 5) })
    setBackgroundShapes(prev => [...prev, clone])
    setSelectedShapeIds([clone.id])
  }

  // A: Layer order — index in array determines draw order (last = on top)
  const moveLayer = (id, dir) => {
    // dir: 'front' | 'back' | 'up' | 'down'
    setBackgroundShapes(prev => {
      const i = prev.findIndex(s => s.id === id)
      if (i < 0) return prev
      const arr = [...prev]
      const [s] = arr.splice(i, 1)
      if (dir === 'front') arr.push(s)
      else if (dir === 'back') arr.unshift(s)
      else if (dir === 'up') arr.splice(Math.min(arr.length, i + 1), 0, s)
      else if (dir === 'down') arr.splice(Math.max(0, i - 1), 0, s)
      return arr
    })
  }

  // I: Toggle lock
  const toggleLock = (id) => updateShape(id, { locked: !(backgroundShapes.find(s => s.id === id)?.locked) })

  // F: Align helpers — align selected shape(s) to canvas
  const alignShape = (where) => {
    const ids = selectedShapeIds.length ? selectedShapeIds : (selectedShapeId ? [selectedShapeId] : [])
    if (!ids.length) return
    const map = { 'tl': { x: 0, y: 0 }, 'tc': { x: 50, y: 0 }, 'tr': { x: 100, y: 0 },
                  'ml': { x: 0, y: 50 }, 'mc': { x: 50, y: 50 }, 'mr': { x: 100, y: 50 },
                  'bl': { x: 0, y: 100 }, 'bc': { x: 50, y: 100 }, 'br': { x: 100, y: 100 } }
    const target = map[where]
    if (!target) return
    updateMany(ids, () => target)
  }

  // E: User templates (saved to localStorage)
  const [userTemplates, setUserTemplates] = useState([])
  useEffect(() => {
    try { const raw = localStorage.getItem('mockup-user-bg-templates'); if (raw) setUserTemplates(JSON.parse(raw)) } catch {}
  }, [])
  const saveUserTemplate = () => {
    if (backgroundShapes.length === 0) { alert('도형이 없습니다.'); return }
    const name = prompt('템플릿 이름:', `My Template ${userTemplates.length + 1}`)
    if (!name) return
    const tpl = { id: `user-${Date.now()}`, label: `⭐ ${name}`, shapes: backgroundShapes }
    const next = [...userTemplates, tpl]
    setUserTemplates(next)
    try { localStorage.setItem('mockup-user-bg-templates', JSON.stringify(next)) } catch {}
  }
  const deleteUserTemplate = (id) => {
    const next = userTemplates.filter(t => t.id !== id)
    setUserTemplates(next)
    try { localStorage.setItem('mockup-user-bg-templates', JSON.stringify(next)) } catch {}
  }

  // D: Upload custom image/SVG
  const shapeImageInputRef = useRef(null)
  const handleShapeImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const s = makeShape({ type: 'image', imageSrc: ev.target.result, size: 200, x: 50, y: 50 })
      setBackgroundShapes(prev => [...prev, s])
      setSelectedShapeIds([s.id])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // C: Keyboard shortcuts — nudge, delete, duplicate, layer order
  useEffect(() => {
    const onKey = (e) => {
      if (!selectedShapeIds.length) return
      // Skip if focused in an input/textarea
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return

      const step = e.shiftKey ? 5 : 1
      const cmd = e.metaKey || e.ctrlKey

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        selectedShapeIds.forEach(id => removeShape(id))
      } else if (cmd && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        selectedShapeIds.forEach(id => duplicateShape(id))
      } else if (cmd && e.key === 'ArrowUp') {
        e.preventDefault()
        selectedShapeIds.forEach(id => moveLayer(id, 'front'))
      } else if (cmd && e.key === 'ArrowDown') {
        e.preventDefault()
        selectedShapeIds.forEach(id => moveLayer(id, 'back'))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); updateMany(selectedShapeIds, (s) => ({ y: Math.max(-50, s.y - step) }))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault(); updateMany(selectedShapeIds, (s) => ({ y: Math.min(150, s.y + step) }))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); updateMany(selectedShapeIds, (s) => ({ x: Math.max(-50, s.x - step) }))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); updateMany(selectedShapeIds, (s) => ({ x: Math.min(150, s.x + step) }))
      } else if (e.key === 'Escape') {
        setSelectedShapeIds([])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedShapeIds, backgroundShapes])

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
  // Custom font
  const [customFont, setCustomFont] = useState(null) // { name, family }
  // Projects
  const [projects, setProjects] = useState([])
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [showProjects, setShowProjects] = useState(false)
  // Before/After layout toggle
  const [beforeAfterMode, setBeforeAfterMode] = useState(false)
  // Export info expanded
  const [showExportInfo, setShowExportInfo] = useState(false)
  const fileInputRef = useRef(null)
  const fontInputRef = useRef(null)
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

  /* ── Template apply ─────────────────────────────────────────── */
  const applyTemplate = useCallback((tmpl) => {
    if (tmpl.bgId) { const b = BACKGROUNDS.find(x => x.id === tmpl.bgId); if (b) setBg(b) }
    if (tmpl.shadowId) { const s = SHADOWS.find(x => x.id === tmpl.shadowId); if (s) setShadow(s) }
    if (tmpl.asBgColor) setAsBgColor(tmpl.asBgColor)
    if (tmpl.asTextColor !== undefined) setAsTextColor(tmpl.asTextColor)
    if (tmpl.asSubColor !== undefined) setAsSubColor(tmpl.asSubColor)
    if (tmpl.asTitleSize) setAsTitleSize(tmpl.asTitleSize)
    if (tmpl.asSubSize) setAsSubSize(tmpl.asSubSize)
    if (tmpl.asTextTop) setAsTextTop(tmpl.asTextTop)
    if (tmpl.asGap != null) setAsGap(tmpl.asGap)
  }, [])

  /* ── Text preset apply ──────────────────────────────────────── */
  const applyTextPreset = useCallback((preset) => {
    setAsTitle(preset.title)
    setAsSubtitle(preset.sub)
  }, [])

  /* ── Demo samples ──────────────────────────────────────────── */
  const loadDemoSamples = useCallback(() => {
    setImages(DEMO_SAMPLES.map(d => ({
      id: `${d.id}-${Date.now()}`,
      src: d.src,
      name: d.name,
      title: '',
      subtitle: '',
      topColor: d.topColor,
      topIsLight: false, // demo gradients are saturated → dark icons don't fit; use white icons
      bottomColor: d.bottomColor,
    })))
  }, [])

  /* ── Custom font upload ────────────────────────────────────── */
  const handleFontUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const fontData = ev.target.result
      const fontName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')
      const fontFamily = `Custom_${fontName}`
      const fontFace = new FontFace(fontFamily, `url(${fontData})`)
      fontFace.load().then(loaded => {
        document.fonts.add(loaded)
        const custom = { id: 'custom', label: file.name.replace(/\.[^.]+$/, '').slice(0, 10), family: fontFamily, isCustom: true }
        setCustomFont(custom)
        setAsFont(custom)
      }).catch(err => {
        console.error('Font load failed:', err)
        alert('폰트 로딩 실패: ' + err.message)
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  /* ── Translate current text ────────────────────────────────── */
  const translateTexts = useCallback((targetLang) => {
    if (asTitle) setAsTitle(translatePhrase(asTitle, targetLang))
    if (asSubtitle) setAsSubtitle(translatePhrase(asSubtitle, targetLang))
    // per-image (individual mode)
    setImages(prev => prev.map(img => ({
      ...img,
      title: img.title ? translatePhrase(img.title, targetLang) : img.title,
      subtitle: img.subtitle ? translatePhrase(img.subtitle, targetLang) : img.subtitle,
    })))
  }, [asTitle, asSubtitle])

  /* ── Projects ──────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mockup-app-projects')
      if (raw) setProjects(JSON.parse(raw))
    } catch {}
  }, [])

  const saveCurrentAsProject = useCallback(() => {
    const name = prompt('프로젝트 이름을 입력하세요:', `Project ${projects.length + 1}`)
    if (!name) return
    const project = {
      id: `proj-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      state: {
        tab, lang, deviceId: device.id, bgId: bg.id, padding, shadowId: shadow.id,
        frameColorId: frameColor.id, fontId: asFont.id,
        asBgColor, asTextColor, asSubColor, asTitle, asSubtitle,
        asTitleSize, asSubSize, asTextTop, asGap, textMode, activeFormats,
      },
      images: images.slice(0, 20),
      thumb: images[0]?.src || null,
    }
    const next = [...projects.filter(p => p.id !== project.id), project].slice(-10) // keep last 10
    setProjects(next)
    setCurrentProjectId(project.id)
    localStorage.setItem('mockup-app-projects', JSON.stringify(next))
  }, [projects, tab, lang, device, bg, padding, shadow, frameColor, asFont, asBgColor, asTextColor, asSubColor, asTitle, asSubtitle, asTitleSize, asSubSize, asTextTop, asGap, textMode, activeFormats, images])

  const loadProject = useCallback((project) => {
    const s = project.state
    if (s.tab) setTab(s.tab)
    if (s.deviceId) { const d = DEVICES.find(x => x.id === s.deviceId); if (d) setDevice(d) }
    if (s.bgId) { const b = BACKGROUNDS.find(x => x.id === s.bgId); if (b) setBg(b) }
    if (s.padding != null) setPadding(s.padding)
    if (s.shadowId) { const sh = SHADOWS.find(x => x.id === s.shadowId); if (sh) setShadow(sh) }
    if (s.frameColorId) { const fc = FRAME_COLORS.find(x => x.id === s.frameColorId); if (fc) setFrameColor(fc) }
    if (s.asBgColor) setAsBgColor(s.asBgColor)
    if (s.asTextColor !== undefined) setAsTextColor(s.asTextColor)
    if (s.asSubColor !== undefined) setAsSubColor(s.asSubColor)
    if (s.asTitle) setAsTitle(s.asTitle)
    if (s.asSubtitle) setAsSubtitle(s.asSubtitle)
    if (s.asTitleSize != null) setAsTitleSize(s.asTitleSize)
    if (s.asSubSize != null) setAsSubSize(s.asSubSize)
    if (s.asTextTop != null) setAsTextTop(s.asTextTop)
    if (s.asGap != null) setAsGap(s.asGap)
    if (s.textMode) setTextMode(s.textMode)
    if (s.activeFormats) setActiveFormats(s.activeFormats)
    if (project.images?.length) setImages(project.images)
    setCurrentProjectId(project.id)
    setShowProjects(false)
  }, [])

  const deleteProject = useCallback((id) => {
    const next = projects.filter(p => p.id !== id)
    setProjects(next)
    localStorage.setItem('mockup-app-projects', JSON.stringify(next))
  }, [projects])

  /* ── File handling ─────────────────────────────────────────── */
  const handleFiles = useCallback((files) => {
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const src = e.target.result
        // Sample top + bottom edge colors for status-bar eraser and smart fill
        let topInfo = null, bottomInfo = null
        try {
          [topInfo, bottomInfo] = await Promise.all([
            sampleImageTop(src),
            sampleImageBottom(src),
          ])
        } catch {}
        setImages(prev => [...prev, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          src,
          name: file.name.replace(/\.[^.]+$/, ''),
          title: '',
          subtitle: '',
          topColor: topInfo?.color,       // top-left 20x20 patch color (status bar eraser)
          topIsLight: topInfo?.isLight,
          bottomColor: bottomInfo?.color, // center-bottom 20x20 patch color (smart fill)
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
          <button onClick={() => setShowProjects(true)} className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-semibold" title="Projects">
            📁 {t.projects}{projects.length > 0 && <span className="ml-1 text-[9px] bg-violet-100 text-violet-600 px-1.5 rounded-full">{projects.length}</span>}
          </button>
          <button onClick={saveCurrentAsProject} disabled={images.length === 0} className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40" title="Save as project">
            💾 {t.saveProject}
          </button>
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
              <div className="w-full max-w-2xl flex flex-col gap-3">
                <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-[16/9] rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-4 transition-all ${isDragging ? 'border-violet-500 bg-violet-50 scale-[1.01]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'}`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragging ? 'bg-violet-100' : 'bg-gray-100'}`}>
                    <Upload className={`w-7 h-7 ${isDragging ? 'text-violet-600' : 'text-gray-300'}`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-[14px] font-semibold ${isDragging ? 'text-violet-700' : 'text-gray-500'}`}>{t.dropTitle}</p>
                    <p className="text-[12px] text-gray-400 mt-1">{t.dropSub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-[11px] text-gray-400 font-medium">OR</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); loadDemoSamples() }}
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-2xl font-semibold text-[13px] shadow-sm transition-all flex items-center justify-center gap-2">
                  ✨ {t.tryDemo} — <span className="opacity-80 font-normal">{t.tryDemoDesc}</span>
                </button>
              </div>
            </div>
          ) : tab === 'graphic' ? (
            /* Graphic tab — show large canvas preview */
            <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className="h-full flex flex-col items-center justify-center gap-4 p-4">
              {/* Hidden export target */}
              <div style={{ position: 'absolute', left: -99999, top: 0, pointerEvents: 'none', overflow: 'visible' }}>
                <StoreGraphicCard images={images} device={device} bgColor={graphicTransparentBg ? 'transparent' : asBgColor} title={asTitle} subtitle={asSubtitle} shadow={shadow} frameColor={frameColor} textColor={asTextColor} orientation={graphicOrientation} titleSize={graphicTitleSize} subSize={graphicSubSize} cardRef={graphicRef} scale={1} fontFamily={asFont.family} graphicShadow={graphicShadow} showText={graphicShowText} textOffsetX={grTextOffsetX} textOffsetY={grTextOffsetY} subTextColor={asSubColor} slots={grSlots} />
              </div>
              {/* Visible preview — fit to container */}
              <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden" ref={el => {
                if (!el) return
                const card = el.querySelector('[data-graphic-preview]')
                if (!card) return
                const fit = () => {
                  const s = Math.min(el.clientWidth / card.offsetWidth, el.clientHeight / card.offsetHeight, 1.8)
                  card.style.transform = `scale(${s})`
                  card.style.transformOrigin = 'center center'
                }
                fit()
                const ro = new ResizeObserver(fit)
                ro.observe(el)
                el._ro = ro
              }}>
                <div data-graphic-preview="">
                  <StoreGraphicCard images={images} device={device} bgColor={graphicTransparentBg ? 'transparent' : asBgColor} title={asTitle} subtitle={asSubtitle} shadow={shadow} frameColor={frameColor} textColor={asTextColor} orientation={graphicOrientation} titleSize={graphicTitleSize} subSize={graphicSubSize} scale={1} fontFamily={asFont.family} graphicShadow={graphicShadow} showText={graphicShowText} textOffsetX={grTextOffsetX} textOffsetY={grTextOffsetY} subTextColor={asSubColor} slots={grSlots} />
                </div>
              </div>
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
              {/* ── Enlarged Preview — AutoFitScaler keeps the whole card on screen ── */}
              {selectedId && images.find(i => i.id === selectedId) && (() => {
                const sel = images.find(i => i.id === selectedId)
                const simpleCardW = (device.frameWidth + padding * 2) + 2
                const _innerW = device.frameWidth - 2 * device.bezel
                const simpleCardH = (_innerW * (device.screenH / device.screenW) + 2 * device.bezel) + padding * 2 + 4
                const cardW = tab === 'simple' ? simpleCardW : 360
                const cardH = tab === 'simple' ? simpleCardH : (previewExportH || 780)
                return (
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 shadow-sm">
                    <div className="flex items-center justify-between w-full shrink-0">
                      <span className="text-[12px] font-semibold text-gray-600">{sel.name}</span>
                      <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Minimize2 className="w-3 h-3" />{t.collapse}
                      </button>
                    </div>
                    <AutoFitScaler cardW={cardW} cardH={cardH} maxVh={55} style={{ ...previewBgHint, borderRadius: 12 }}>
                      {tab === 'simple' ? (
                        <SimpleMockupCard src={sel.src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} scale={1} topColor={sel.topColor} topIsLight={sel.topIsLight} bottomColor={sel.bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBarMode} backgroundShapes={backgroundShapes} selectedShapeIds={selectedShapeIds} onSelectShape={(id, e) => { if (id == null) { setSelectedShapeIds([]); return } if (e?.shiftKey) { setSelectedShapeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) } else { setSelectedShapeIds([id]) } }} onMoveShape={moveShape} onResizeShape={(id, upd) => updateShape(id, upd)} interactiveShapes />
                      ) : (
                        <AppStoreMockupCard src={sel.src} device={previewFmtDevice} bgColor={asBgColor} title={getTitle(sel)} subtitle={getSubtitle(sel)} shadow={shadow} frameColor={frameColor} textColor={asTextColor} titleSize={asTitleSize} subSize={asSubSize} textTop={asTextTop} gap={asGap} exportW={360} exportH={previewExportH} scale={1} fontFamily={asFont.family} subTextColor={asSubColor} topColor={sel.topColor} topIsLight={sel.topIsLight} bottomColor={sel.bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBarMode} backgroundShapes={backgroundShapes} selectedShapeIds={selectedShapeIds} onSelectShape={(id, e) => { if (id == null) { setSelectedShapeIds([]); return } if (e?.shiftKey) { setSelectedShapeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) } else { setSelectedShapeIds([id]) } }} onMoveShape={moveShape} onResizeShape={(id, upd) => updateShape(id, upd)} interactiveShapes />
                      )}
                    </AutoFitScaler>
                  </div>
                )
              })()}

              {/* ── Before/After Preview (Simple tab only) — PreviewScaler ─── */}
              {tab === 'simple' && beforeAfterMode && images.length >= 2 && (() => {
                const simpleCardW = (device.frameWidth + padding * 2) + 2
                const _innerW = device.frameWidth - 2 * device.bezel; const simpleCardH = (_innerW * (device.screenH / device.screenW) + 2 * device.bezel) + padding * 2 + 4
                return (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 shadow-sm">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider self-start">Before / After</p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-400">BEFORE</span>
                      <PreviewScaler width={simpleCardW} height={simpleCardH} scale={0.6}>
                        <SimpleMockupCard src={images[0].src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} scale={1} topColor={images[0].topColor} topIsLight={images[0].topIsLight} bottomColor={images[0].bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBarMode} backgroundShapes={backgroundShapes} />
                      </PreviewScaler>
                    </div>
                    <div className="text-[24px] text-gray-300">→</div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-violet-500">AFTER</span>
                      <PreviewScaler width={simpleCardW} height={simpleCardH} scale={0.6}>
                        <SimpleMockupCard src={images[1].src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} scale={1} topColor={images[1].topColor} topIsLight={images[1].topIsLight} bottomColor={images[1].bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBarMode} backgroundShapes={backgroundShapes} />
                      </PreviewScaler>
                    </div>
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
                {images.map((img) => {
                  // Fixed-pixel card dimensions — SAME DOM is used for preview + export
                  const simpleCardW = (device.frameWidth + padding * 2) + 2  // +2 buffer
                  const _innerW = device.frameWidth - 2 * device.bezel; const simpleCardH = (_innerW * (device.screenH / device.screenW) + 2 * device.bezel) + padding * 2 + 4
                  const fmtFixedW = 360
                  const fmtFixedH = previewExportH || 780
                  return (
                  <div key={img.id} className="group relative flex flex-col items-center">
                    {tab === 'appstore' && (
                      /* Hidden full-res export targets — required for export since thumb uses DIFFERENT format */
                      <div style={{ position: 'absolute', left: -99999, top: 0, pointerEvents: 'none', overflow: 'visible' }}>
                        {STORE_PRESETS.flatMap(s => s.formats).filter(f => activeFormats.includes(f.id)).map(fmt => {
                          const fmtDevice = DEVICES.find(d => d.id === fmt.deviceId) || device
                          return <AppStoreMockupCard key={fmt.id} src={img.src} device={fmtDevice} bgColor={asBgColor} title={getTitle(img)} subtitle={getSubtitle(img)} shadow={shadow} frameColor={frameColor} textColor={asTextColor} titleSize={asTitleSize} subSize={asSubSize} textTop={asTextTop} gap={asGap} exportW={360} exportH={360 * (fmt.h / fmt.w)} cardRef={el => { cardRefs.current[`${img.id}-${fmt.id}`] = el }} scale={1} fontFamily={asFont.family} subTextColor={asSubColor} topColor={img.topColor} topIsLight={img.topIsLight} bottomColor={img.bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBarMode} backgroundShapes={backgroundShapes} />
                        })}
                      </div>
                    )}

                    {/*
                      VISIBLE THUMB — PreviewScaler architecture:
                      The card renders at FIXED pixels (scale=1). A CSS transform on the
                      wrapper visually shrinks it to thumbnail size. For Simple tab, the
                      SAME scaled element is the export source (cardRef attached), so preview
                      and export are guaranteed pixel-identical.
                    */}
                    <div
                      onClick={() => setSelectedId(selectedId === img.id ? null : img.id)}
                      className={`rounded-xl w-full flex items-center justify-center p-2 cursor-pointer transition-all ${selectedId === img.id ? 'ring-2 ring-violet-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}`}
                      style={{ ...previewBgHint, minHeight: 140, overflow: 'hidden' }}
                    >
                      {tab === 'simple' ? (
                        <PreviewScaler width={simpleCardW} height={simpleCardH} scale={thumbScale}>
                          <SimpleMockupCard src={img.src} device={device} bg={bg} padding={padding} shadow={shadow} frameColor={frameColor} cardRef={el => { cardRefs.current[img.id] = el }} scale={1} topColor={img.topColor} topIsLight={img.topIsLight} bottomColor={img.bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBarMode} backgroundShapes={backgroundShapes} />
                        </PreviewScaler>
                      ) : (
                        <PreviewScaler width={fmtFixedW} height={fmtFixedH} scale={thumbScale}>
                          <AppStoreMockupCard src={img.src} device={previewFmtDevice} bgColor={asBgColor} title={getTitle(img)} subtitle={getSubtitle(img)} shadow={shadow} frameColor={frameColor} textColor={asTextColor} titleSize={asTitleSize} subSize={asSubSize} textTop={asTextTop} gap={asGap} exportW={360} exportH={previewExportH} scale={1} fontFamily={asFont.family} subTextColor={asSubColor} topColor={img.topColor} topIsLight={img.topIsLight} bottomColor={img.bottomColor} coverColor={coverColor} cleanStatusBar={cleanStatusBarMode} backgroundShapes={backgroundShapes} />
                        </PreviewScaler>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => exportSingle(img.id)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white" title="Download"><Download className="w-3.5 h-3.5 text-gray-600" /></button>
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50" title="Remove"><X className="w-3.5 h-3.5 text-gray-500" /></button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 truncate max-w-full px-2 font-medium">{img.name}</p>
                  </div>
                  )
                })}

                <div onClick={() => fileInputRef.current?.click()} className="rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[160px] transition-colors hover:bg-gray-50">
                  <ImagePlus className="w-5 h-5 text-gray-300" /><span className="text-[11px] text-gray-400 font-medium">{t.add}</span>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ── SIDEBAR (Toss-style: gray bg + white cards) ─────── */}
        <aside className="w-full lg:w-[300px] bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto shrink-0 flex flex-col max-h-[70vh] lg:max-h-none">
          {/* Segmented Control */}
          <div className="p-4 pb-2">
            <div className="flex bg-white rounded-xl p-0.5 gap-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {[['simple', t.simpleDevice], ['appstore', t.storeScreenshot], ['graphic', 'Graphic']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${tab === id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="p-4 pt-2 flex flex-col gap-3 flex-1">
            {/* ═══════════════════════════════════════════════════
                GROUP 1: 기기 설정 (Device & Screen)
                ═══════════════════════════════════════════════════ */}
            <AccordionGroup emoji="📱" title={lang === 'ko' ? '기기 설정' : lang === 'zh' ? '设备设置' : 'Device'} defaultOpen>
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

            {/* ── SHARED: Frame Color (phone/tablet) ─────────── */}
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

            {/* ── SHARED: Clean Status Bar 3-mode selector (per-device) ──── */}
            {(device.type === 'iphone' || device.type === 'samsung' || device.type === 'ipad' || device.type === 'android-tab') && device.statusBarH && (
              <Section title={lang === 'ko' ? '상태바 9:41' : lang === 'zh' ? '状态栏 9:41' : 'Status Bar 9:41'} icon={Smartphone}>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'off',   label: lang === 'ko' ? 'OFF'    : 'Off',    hint: lang === 'ko' ? '원본 유지'           : 'Original' },
                    { id: 'show',  label: lang === 'ko' ? '표시'   : 'Show',   hint: lang === 'ko' ? '안가리고 띄우기'     : 'Overlay only' },
                    { id: 'cover', label: lang === 'ko' ? '가리기' : 'Cover',  hint: lang === 'ko' ? '원본 가리고 띄우기' : 'Mask + overlay' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setCleanStatusBarMode(opt.id)}
                      title={opt.hint}
                      className={`py-2 text-[10px] font-bold rounded-lg transition-all ${cleanStatusBarMode === opt.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">
                  {lang === 'ko'
                    ? cleanStatusBarMode === 'show'  ? '원본 상단 위에 9:41 표시 (원본에 상태바가 없을 때)'
                    : cleanStatusBarMode === 'cover' ? '원본 상단을 가리고 9:41 표시 (시뮬레이터 상태바 교체)'
                    : '원본 스크린샷 그대로 렌더링'
                    : cleanStatusBarMode === 'show'  ? 'Overlay 9:41 on top (if image has no status bar)'
                    : cleanStatusBarMode === 'cover' ? 'Mask original + overlay 9:41 (hide simulator UI)'
                    : 'Show original screenshot as-is'}
                </p>

                {/* Cover Color palette — only visible when Cover mode is active */}
                {cleanStatusBarMode === 'cover' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {lang === 'ko' ? '커버 컬러' : lang === 'zh' ? '覆盖颜色' : 'Cover Color'}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Auto — samples image top pixel */}
                      <button
                        onClick={() => setCoverColor(null)}
                        title={lang === 'ko' ? '이미지 상단 색상 자동 감지' : 'Auto-detect from image'}
                        className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${coverColor === null ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                        {lang === 'ko' ? '자동' : 'Auto'}
                      </button>
                      {/* Preset colors */}
                      {[
                        { color: '#ffffff', label: 'White' },
                        { color: '#000000', label: 'Black' },
                        { color: '#f5f5f7', label: 'Light' },
                        { color: '#1d1d1f', label: 'Dark' },
                        { color: '#6366f1', label: 'Indigo' },
                        { color: '#ec4899', label: 'Pink' },
                        { color: '#10b981', label: 'Emerald' },
                        { color: '#f59e0b', label: 'Amber' },
                      ].map(({ color, label }) => (
                        <button
                          key={color}
                          onClick={() => setCoverColor(color)}
                          title={label}
                          className={`w-7 h-7 rounded-lg border transition-all ${coverColor === color ? 'ring-2 ring-gray-900 ring-offset-1 scale-110' : 'border-gray-200 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      {/* Custom color picker */}
                      <label className="relative w-7 h-7 rounded-lg border border-gray-200 overflow-hidden cursor-pointer flex items-center justify-center hover:scale-105 transition-all" title={lang === 'ko' ? '직접 선택' : 'Custom'}>
                        <input
                          type="color"
                          value={coverColor && coverColor.startsWith('#') ? coverColor : '#888888'}
                          onChange={e => setCoverColor(e.target.value)}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ background: 'conic-gradient(from 180deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }} />
                      </label>
                    </div>
                  </div>
                )}
              </Section>
            )}
            </AccordionGroup>

            {/* ═══════════════════════════════════════════════════
                GROUP 2: 배경 꾸미기 (Canvas & Decor)
                ═══════════════════════════════════════════════════ */}
            <AccordionGroup emoji="🎨" title={lang === 'ko' ? '배경 꾸미기' : lang === 'zh' ? '背景装饰' : 'Canvas & Decor'} defaultOpen>
            {/* ── TAB 1: Simple ─────────────────────────────── */}
            {tab === 'simple' && (
              <>
                <Section title={t.template} icon={Layers}>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEMPLATES.slice(0, 6).map(tmpl => (
                      <button key={tmpl.id} onClick={() => applyTemplate(tmpl)}
                        className="px-2 py-2 rounded-lg text-[11px] font-semibold bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-all text-left">
                        <div>{tmpl.label}</div>
                        <div className="text-[9px] text-gray-400 font-normal truncate">{tmpl.desc}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">{t.templateHint}</p>
                </Section>

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

                <Section title={t.beforeAfter} icon={Layers}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">{t.beforeAfterDesc}</span>
                    <button onClick={() => setBeforeAfterMode(!beforeAfterMode)} className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${beforeAfterMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>{beforeAfterMode ? 'ON' : 'OFF'}</button>
                  </div>
                  {beforeAfterMode && <p className="text-[10px] text-gray-400 mt-1.5">{lang === 'ko' ? '이미지 2장을 좌우로 나란히 표시합니다' : lang === 'zh' ? '并排显示两张截图' : 'First 2 images shown side by side'}</p>}
                </Section>
              </>
            )}

            {/* ── TAB 2: App Store ──────────────────────────── */}
            {tab === 'appstore' && (
              <>
                {/* Template library */}
                <Section title={t.template} icon={Layers}>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto">
                    {TEMPLATES.map(tmpl => (
                      <button key={tmpl.id} onClick={() => applyTemplate(tmpl)}
                        className="px-2 py-2 rounded-lg text-[11px] font-semibold bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-all text-left">
                        <div className="truncate">{tmpl.label}</div>
                        <div className="text-[9px] text-gray-400 font-normal truncate">{tmpl.desc}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">{t.templateHint}</p>
                </Section>

                {/* Store format presets with badges & counter */}
                <Section title={t.storeSize} icon={PackageCheck}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-gray-400">{t.checkedCount(activeFormats.length)}</p>
                    <button
                      onClick={() => {
                        const required = Object.keys(FORMAT_BADGES)
                        setActiveFormats(prev => Array.from(new Set([...prev, ...required])))
                      }}
                      className="text-[10px] font-semibold text-violet-600 hover:text-violet-800">
                      ★ {lang === 'ko' ? '필수만' : lang === 'zh' ? '必需' : 'Required'}
                    </button>
                  </div>
                  {STORE_PRESETS.map(store => (
                    <div key={store.id} className="mb-3">
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">{store.label}</p>
                      <div className="flex flex-col gap-1">
                        {store.formats.map(fmt => {
                          const badge = FORMAT_BADGES[fmt.id]
                          return (
                            <label key={fmt.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-[11px]">
                              <input type="checkbox" checked={activeFormats.includes(fmt.id)} onChange={e => {
                                if (e.target.checked) setActiveFormats(prev => [...prev, fmt.id])
                                else setActiveFormats(prev => prev.filter(x => x !== fmt.id))
                              }} className="accent-violet-600 w-3.5 h-3.5" />
                              <span className="font-semibold text-gray-700 flex-1">{fmt.label.replace(/ ★$/, '')}</span>
                              {badge && <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">★</span>}
                              <span className="text-[9px] text-gray-400 font-mono">{fmt.w}×{fmt.h}</span>
                            </label>
                          )
                        })}
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

                {/* Text preset library */}
                <Section title={t.textPresets} icon={Type}>
                  <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                    {(TEXT_PRESETS[lang] || TEXT_PRESETS.en).map((preset, idx) => (
                      <button key={idx} onClick={() => applyTextPreset(preset)}
                        className="px-2.5 py-2 rounded-lg text-left bg-gray-50 hover:bg-violet-50 transition-all">
                        <div className="text-[11px] font-bold text-gray-700 truncate">{preset.title}</div>
                        <div className="text-[10px] text-gray-400 truncate">{preset.sub}</div>
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Auto-translate */}
                <Section title={t.autoTranslate} icon={Globe}>
                  <div className="grid grid-cols-4 gap-1">
                    {[['en','EN'],['ko','KR'],['zh','中'],['ja','日']].map(([code, label]) => (
                      <button key={code} onClick={() => translateTexts(code)}
                        className="py-1.5 text-[10px] font-bold rounded-lg bg-gray-50 text-gray-600 hover:bg-violet-100 hover:text-violet-700 transition-all">
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">{t.translateTo}</p>
                </Section>

                {/* Text size — always global (layout) */}
                <Section title="폰트" icon={Type}>
                  <div className="flex gap-1.5 mb-2">
                    {FONT_OPTIONS.map(f => (
                      <button key={f.id} onClick={() => setAsFont(f)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${asFont.id === f.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`} style={{ fontFamily: f.family }}>{f.label}</button>
                    ))}
                    {customFont && (
                      <button onClick={() => setAsFont(customFont)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${asFont.id === customFont.id ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`} style={{ fontFamily: customFont.family }} title={customFont.label}>{customFont.label}</button>
                    )}
                  </div>
                  <button onClick={() => fontInputRef.current?.click()}
                    className="w-full py-1.5 text-[10px] font-semibold rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 border border-dashed border-gray-300">
                    + {t.uploadFont}
                  </button>
                  <input ref={fontInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleFontUpload} />
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

            {/* ── SHARED: Background Shapes Decorations ────────── */}
            <Section title={lang === 'ko' ? '배경 꾸미기' : lang === 'zh' ? '背景装饰' : 'Background Shapes'} icon={Layers}>
              {/* Template dropdown (built-in + user templates) */}
              <select
                defaultValue=""
                onChange={e => { if (e.target.value) { applyBgTemplate(e.target.value); e.target.value = '' } }}
                className="w-full text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="">{lang === 'ko' ? '📋 템플릿 선택...' : 'Choose template...'}</option>
                <optgroup label={lang === 'ko' ? '기본 템플릿' : 'Built-in'}>
                  {Object.entries(BG_TEMPLATES).map(([id, tpl]) => (
                    <option key={id} value={id}>{tpl.label}</option>
                  ))}
                </optgroup>
                {userTemplates.length > 0 && (
                  <optgroup label={lang === 'ko' ? '내 템플릿' : 'My Templates'}>
                    {userTemplates.map(tpl => (
                      <option key={tpl.id} value={tpl.id}>{tpl.label}</option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Save / Manage user templates */}
              <div className="flex gap-1.5 mb-2">
                <button onClick={saveUserTemplate} disabled={backgroundShapes.length === 0} className="flex-1 px-2 py-1.5 text-[10px] font-bold rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-40" title="현재 배치를 내 템플릿으로 저장">
                  💾 {lang === 'ko' ? '템플릿 저장' : 'Save template'}
                </button>
                {userTemplates.length > 0 && (
                  <button onClick={() => {
                    if (confirm(lang === 'ko' ? '삭제할 내 템플릿 이름을 입력:' : 'Template to delete:')) {
                      const name = prompt(lang === 'ko' ? '삭제할 이름 입력 (취소는 빈칸):' : 'Name:')
                      const tpl = userTemplates.find(t => t.label.includes(name))
                      if (tpl) deleteUserTemplate(tpl.id)
                    }
                  }} className="px-2 py-1.5 text-[10px] text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg" title="Manage user templates">🗂</button>
                )}
              </div>

              {/* Add shape dropdown + Custom image upload */}
              <div className="flex gap-1.5 mb-2">
                <select
                  defaultValue=""
                  onChange={e => { if (e.target.value) { addShape(e.target.value); e.target.value = '' } }}
                  className="flex-1 text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <option value="">{lang === 'ko' ? '+ 도형 추가...' : '+ Add shape...'}</option>
                  {SHAPE_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <button onClick={() => shapeImageInputRef.current?.click()} className="px-2 py-2 text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg" title={lang === 'ko' ? '이미지/SVG 업로드' : 'Upload image'}>📷</button>
                <input ref={shapeImageInputRef} type="file" accept="image/*,.svg" className="hidden" onChange={handleShapeImageUpload} />
                {backgroundShapes.length > 0 && (
                  <button onClick={() => { setBackgroundShapes([]); setSelectedShapeIds([]) }} className="px-2 py-2 text-[10px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg" title="Clear all">✕</button>
                )}
              </div>

              {/* Shape list with lock + duplicate + layer buttons */}
              {backgroundShapes.length > 0 && (
                <div className="flex flex-col gap-1 mb-2 max-h-[160px] overflow-y-auto">
                  {backgroundShapes.slice().reverse().map((s, ri) => {
                    const i = backgroundShapes.length - 1 - ri
                    const isSelected = selectedShapeIds.includes(s.id)
                    return (
                    <div key={s.id}
                      onClick={(e) => {
                        if (e.shiftKey) {
                          setSelectedShapeIds(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])
                        } else {
                          setSelectedShapeIds([s.id])
                        }
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-violet-100 ring-1 ring-violet-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <div style={{ width: 12, height: 12, borderRadius: s.type.includes('circle') || s.type === 'ring' || s.type === 'soft-blob' || s.type === 'donut' || s.type === 'gradient-orb' ? '50%' : 3, background: s.color, flexShrink: 0 }} />
                      <span className="text-[11px] font-semibold text-gray-600 flex-1 truncate">
                        {SHAPE_TYPES.find(st => st.id === s.type)?.emoji || (s.type === 'image' ? '🖼' : '●')} #{i + 1}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); toggleLock(s.id) }} className="text-gray-400 hover:text-amber-500 text-[11px]" title={s.locked ? 'Unlock' : 'Lock'}>{s.locked ? '🔒' : '🔓'}</button>
                      <button onClick={(e) => { e.stopPropagation(); duplicateShape(s.id) }} className="text-gray-400 hover:text-violet-500 text-[11px]" title="Duplicate (⌘D)">⧉</button>
                      <button onClick={(e) => { e.stopPropagation(); removeShape(s.id) }} className="text-gray-400 hover:text-red-500 text-[11px]" title="Delete">✕</button>
                    </div>
                    )
                  })}
                </div>
              )}

              {/* Multi-select indicator */}
              {selectedShapeIds.length > 1 && (
                <div className="mb-2 px-2 py-1 bg-violet-50 text-violet-700 text-[10px] font-semibold rounded-lg flex items-center justify-between">
                  <span>🔗 {selectedShapeIds.length}개 선택됨</span>
                  <button onClick={() => setSelectedShapeIds([])} className="text-violet-500 hover:text-violet-800">✕</button>
                </div>
              )}

              {/* Selected shape editor */}
              {selectedShape && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-2">
                  {/* A: Layer order + B: Duplicate + I: Lock toggle */}
                  <div className="flex gap-1">
                    <button onClick={() => moveLayer(selectedShape.id, 'back')} className="flex-1 px-1 py-1 text-[10px] font-bold rounded bg-gray-50 hover:bg-gray-100 text-gray-600" title="맨 뒤로 (⌘↓)">⤓</button>
                    <button onClick={() => moveLayer(selectedShape.id, 'down')} className="flex-1 px-1 py-1 text-[10px] font-bold rounded bg-gray-50 hover:bg-gray-100 text-gray-600" title="한 단계 뒤로">↓</button>
                    <button onClick={() => moveLayer(selectedShape.id, 'up')} className="flex-1 px-1 py-1 text-[10px] font-bold rounded bg-gray-50 hover:bg-gray-100 text-gray-600" title="한 단계 앞으로">↑</button>
                    <button onClick={() => moveLayer(selectedShape.id, 'front')} className="flex-1 px-1 py-1 text-[10px] font-bold rounded bg-gray-50 hover:bg-gray-100 text-gray-600" title="맨 앞으로 (⌘↑)">⤒</button>
                    <button onClick={() => duplicateShape(selectedShape.id)} className="flex-1 px-1 py-1 text-[10px] font-bold rounded bg-violet-50 hover:bg-violet-100 text-violet-700" title="복제 (⌘D)">⧉</button>
                    <button onClick={() => toggleLock(selectedShape.id)} className={`flex-1 px-1 py-1 text-[10px] font-bold rounded ${selectedShape.locked ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`} title="잠금">{selectedShape.locked ? '🔒' : '🔓'}</button>
                  </div>

                  {/* F: Align helpers (9-grid) */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold">{lang === 'ko' ? '정렬' : 'Align'}</label>
                    <div className="grid grid-cols-3 gap-0.5 mt-1 w-fit">
                      {[['tl','↖'],['tc','↑'],['tr','↗'],['ml','←'],['mc','⊙'],['mr','→'],['bl','↙'],['bc','↓'],['br','↘']].map(([key, arrow]) => (
                        <button key={key} onClick={() => alignShape(key)} className="w-7 h-7 text-[11px] font-bold rounded bg-gray-50 hover:bg-violet-100 text-gray-600 hover:text-violet-700" title={key}>{arrow}</button>
                      ))}
                    </div>
                  </div>

                  {/* Type switcher */}
                  <select
                    value={selectedShape.type}
                    onChange={e => updateShape(selectedShape.id, { type: e.target.value })}
                    className="w-full text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  >
                    {SHAPE_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                    <option value="image">🖼 Custom Image</option>
                  </select>
                  {/* Color */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 w-8">색상</label>
                    <input type="color" value={selectedShape.color} onChange={e => updateShape(selectedShape.id, { color: e.target.value })} className="w-8 h-7 rounded border border-gray-200 cursor-pointer p-0.5" />
                    <input type="text" value={selectedShape.color} onChange={e => updateShape(selectedShape.id, { color: e.target.value })} className="flex-1 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1" />
                  </div>
                  {selectedShape.type === 'gradient-orb' && (
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-gray-400 w-8">색2</label>
                      <input type="color" value={selectedShape.color2 || '#ffffff'} onChange={e => updateShape(selectedShape.id, { color2: e.target.value })} className="w-8 h-7 rounded border border-gray-200 cursor-pointer p-0.5" />
                      <input type="text" value={selectedShape.color2 || ''} onChange={e => updateShape(selectedShape.id, { color2: e.target.value })} className="flex-1 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1" />
                    </div>
                  )}
                  {/* Size */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 w-8 shrink-0">크기</label>
                    <input type="range" min={20} max={800} value={selectedShape.size} onChange={e => updateShape(selectedShape.id, { size: +e.target.value })} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{selectedShape.size}</span>
                  </div>
                  {/* X */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 w-8 shrink-0">X</label>
                    <input type="range" min={-50} max={150} value={selectedShape.x} onChange={e => updateShape(selectedShape.id, { x: +e.target.value })} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{Math.round(selectedShape.x)}%</span>
                  </div>
                  {/* Y */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 w-8 shrink-0">Y</label>
                    <input type="range" min={-50} max={150} value={selectedShape.y} onChange={e => updateShape(selectedShape.id, { y: +e.target.value })} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{Math.round(selectedShape.y)}%</span>
                  </div>
                  {/* Opacity */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 w-8 shrink-0">투명도</label>
                    <input type="range" min={0} max={100} value={Math.round(selectedShape.opacity * 100)} onChange={e => updateShape(selectedShape.id, { opacity: +e.target.value / 100 })} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{Math.round(selectedShape.opacity * 100)}%</span>
                  </div>
                  {/* Blur */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 w-8 shrink-0">블러</label>
                    <input type="range" min={0} max={100} value={selectedShape.blur || 0} onChange={e => updateShape(selectedShape.id, { blur: +e.target.value })} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{selectedShape.blur || 0}</span>
                  </div>
                  {/* Rotate */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 w-8 shrink-0">회전</label>
                    <input type="range" min={0} max={360} value={selectedShape.rotate || 0} onChange={e => updateShape(selectedShape.id, { rotate: +e.target.value })} className="flex-1 accent-gray-900 h-1" />
                    <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{selectedShape.rotate || 0}°</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-400 mt-2 leading-snug">
                {lang === 'ko'
                  ? '💡 드래그 이동 · Shift+클릭 다중선택 · ←→↑↓ 1px(+Shift 5px) · ⌘D 복제 · ⌘↑/↓ 레이어 · Delete 삭제'
                  : '💡 Drag · Shift-click multi · Arrows nudge · ⌘D duplicate · ⌘↑/↓ layer · Delete'}
              </p>
            </Section>

            {/* ── SHARED: Shadow ────────────────────────────── */}
            <Section title={t.shadow} icon={Layers}>
              <div className="grid grid-cols-2 gap-1.5">
                {SHADOWS.map(s => (
                  <button key={s.id} onClick={() => setShadow(s)} className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${shadow.id === s.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>{s.label}</button>
                ))}
              </div>
            </Section>
            </AccordionGroup>
            {/* End of GROUP 2 (Canvas & Decor) */}

            {images.length === 0 && (
              <div className="p-4 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] text-gray-500"><span className="font-semibold text-gray-800">💡 Tip: </span>
                  {tab === 'simple' ? t.tipSimple : t.tipStore}
                </p>
              </div>
            )}

          </div>
        </aside>
      </div>

      {/* Google AdSense auto ads handle placement automatically */}

      {/* ── Projects modal ────────────────────────────────────── */}
      {showProjects && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowProjects(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-gray-900">📁 {t.projects}</h2>
              <button onClick={() => setShowProjects(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {projects.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-[13px]">
                  <p>저장된 프로젝트가 없습니다.</p>
                  <p className="text-[11px] mt-1">💾 Save 버튼으로 현재 작업을 저장하세요.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {projects.slice().reverse().map(p => (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${currentProjectId === p.id ? 'border-violet-400 bg-violet-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                      {p.thumb ? (
                        <img src={p.thumb} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">📷</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{new Date(p.savedAt).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">{p.images?.length || 0}장 · {p.state?.tab}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => loadProject(p)} className="px-3 py-1 bg-violet-600 text-white text-[11px] font-semibold rounded-lg hover:bg-violet-700">{t.loadProject}</button>
                        <button onClick={() => { if (confirm('삭제할까요?')) deleteProject(p.id) }} className="px-3 py-1 text-gray-400 hover:text-red-500 text-[11px]">삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

/* ═══════════════════════════════════════════════════════════════
   AccordionGroup — Toss-style card with collapse/expand
   ═══════════════════════════════════════════════════════════════ */
function AccordionGroup({ title, icon: Icon, emoji, defaultOpen = true, badge, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3.5 hover:bg-gray-50 transition-colors"
      >
        {emoji ? (
          <span className="text-[15px]">{emoji}</span>
        ) : Icon ? (
          <Icon className="w-4 h-4 text-gray-600" />
        ) : null}
        <span className="flex-1 text-left text-[13px] font-bold text-gray-900">{title}</span>
        {badge}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-250"
        style={{ maxHeight: open ? '3000px' : '0', opacity: open ? 1 : 0 }}
      >
        <div className="px-4 pb-4 pt-1 flex flex-col gap-4">
          {children}
        </div>
      </div>
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
