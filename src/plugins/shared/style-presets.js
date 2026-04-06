export const HEADING_OPTIONS = [
  { label: '正文', value: 'paragraph' },
  { label: 'H1', value: 'h1', level: 1 },
  { label: 'H2', value: 'h2', level: 2 },
  { label: 'H3', value: 'h3', level: 3 },
  { label: 'H4', value: 'h4', level: 4 },
  { label: 'H5', value: 'h5', level: 5 },
  { label: 'H6', value: 'h6', level: 6 },
]

export const FONT_FAMILY_OPTIONS = [
  { label: '系统默认', value: null, cssValue: null },
  { label: '宋体', value: 'SimSun, Songti SC, serif', cssValue: 'SimSun, Songti SC, serif' },
  { label: '楷体', value: 'KaiTi, STKaiti, serif', cssValue: 'KaiTi, STKaiti, serif' },
  {
    label: '黑体',
    value: 'SimHei, Heiti SC, sans-serif',
    cssValue: 'SimHei, Heiti SC, sans-serif',
  },
  {
    label: '思源黑体',
    value: '"Source Han Sans SC", "Noto Sans CJK SC", sans-serif',
    cssValue: '"Source Han Sans SC", "Noto Sans CJK SC", sans-serif',
  },
  {
    label: '微软雅黑',
    value: '"Microsoft YaHei", sans-serif',
    cssValue: '"Microsoft YaHei", sans-serif',
  },
  { label: 'Arial', value: 'Arial, sans-serif', cssValue: 'Arial, sans-serif' },
  {
    label: 'Times New Roman',
    value: '"Times New Roman", serif',
    cssValue: '"Times New Roman", serif',
  },
  { label: 'Courier New', value: '"Courier New", monospace', cssValue: '"Courier New", monospace' },
]

export const FONT_SIZE_OPTIONS = [
  '9px',
  '10px',
  '11px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '22px',
  '24px',
  '26px',
  '28px',
  '32px',
  '36px',
  '48px',
  '72px',
].map((value) => ({ label: value.replace('px', ''), value }))

export const TEXT_COLOR_PRESETS = [
  '#333333',
  '#9CA3AF',
  '#C4A484',
  '#F59E0B',
  '#D4A017',
  '#2E8B57',
  '#3B82F6',
  '#1D4ED8',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
]

export const HIGHLIGHT_COLOR_PRESETS = [
  '#FFFFFF',
  '#E5E7EB',
  '#E7DCD1',
  '#F2D3B3',
  '#F6E7B0',
  '#CFE3DA',
  '#CFE0F1',
  '#DAD1E9',
  '#EBD1DC',
  '#F2D2CF',
  '#FEF08A',
]

export const CALLOUT_TYPES = [
  {
    value: 'default',
    label: '默认 / Default',
    shortLabel: 'Default',
    textColor: '#6B7280',
    backgroundColor: '#F3F4F6',
    icon: null,
  },
  {
    value: 'note',
    label: '备注 / Note',
    shortLabel: 'Note',
    textColor: '#9333EA',
    backgroundColor: '#FAF8FF',
    icon: 'note',
  },
  {
    value: 'tip',
    label: '提示 / Tip',
    shortLabel: 'Tip',
    textColor: '#16A34A',
    backgroundColor: '#FDFEEF',
    icon: 'tip',
  },
  {
    value: 'important',
    label: '重要 / Important',
    shortLabel: 'Important',
    textColor: '#2563EB',
    backgroundColor: '#F0F9FF',
    icon: 'important',
  },
  {
    value: 'warning',
    label: '警告 / Warning',
    shortLabel: 'Warning',
    textColor: '#DC2626',
    backgroundColor: '#FEF2F2',
    icon: 'warning',
  },
  {
    value: 'success',
    label: '成功 / Success',
    shortLabel: 'Success',
    textColor: '#15803D',
    backgroundColor: '#F0FDF4',
    icon: 'success',
  },
]

const CALLOUT_TYPE_MAP = new Map(CALLOUT_TYPES.map((item) => [item.value, item]))

export function getCalloutTypeConfig(value) {
  return CALLOUT_TYPE_MAP.get(value) || CALLOUT_TYPES[0]
}

export function getCalloutIconMarkup(typeOrValue) {
  const type =
    typeof typeOrValue === 'string'
      ? getCalloutTypeConfig(typeOrValue)
      : typeOrValue || CALLOUT_TYPES[0]

  const icons = {
    note: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
    tip: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
    important: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`,
  }

  return type.icon ? icons[type.icon] || '' : ''
}

export function getCalloutIconSpec(typeOrValue) {
  const type =
    typeof typeOrValue === 'string'
      ? getCalloutTypeConfig(typeOrValue)
      : typeOrValue || CALLOUT_TYPES[0]

  const svgAttrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  }

  const specs = {
    note: [
      'svg',
      svgAttrs,
      [
        'path',
        {
          d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
        },
      ],
      ['path', { d: 'm15 5 4 4' }],
    ],
    tip: [
      'svg',
      svgAttrs,
      [
        'path',
        {
          d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
        },
      ],
      ['path', { d: 'M9 18h6' }],
      ['path', { d: 'M10 22h4' }],
    ],
    important: [
      'svg',
      svgAttrs,
      ['circle', { cx: '12', cy: '12', r: '10' }],
      ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }],
      ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }],
    ],
    warning: [
      'svg',
      svgAttrs,
      ['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }],
      ['path', { d: 'M12 9v4' }],
      ['path', { d: 'M12 17h.01' }],
    ],
    success: ['svg', svgAttrs, ['path', { d: 'M20 6 9 17l-5-5' }]],
  }

  return type.icon ? specs[type.icon] || null : null
}
