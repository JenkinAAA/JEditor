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
    { label: '黑体', value: 'SimHei, Heiti SC, sans-serif', cssValue: 'SimHei, Heiti SC, sans-serif' },
    { label: '思源黑体', value: '"Source Han Sans SC", "Noto Sans CJK SC", sans-serif', cssValue: '"Source Han Sans SC", "Noto Sans CJK SC", sans-serif' },
    { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif', cssValue: '"Microsoft YaHei", sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif', cssValue: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif', cssValue: '"Times New Roman", serif' },
    { label: 'Courier New', value: '"Courier New", monospace', cssValue: '"Courier New", monospace' },
]

export const FONT_SIZE_OPTIONS = [
    '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px',
    '22px', '24px', '26px', '28px', '32px', '36px', '48px', '72px',
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
    {
        value: 'help',
        label: '疑问 / Help',
        shortLabel: 'Help',
        textColor: '#0EA5E9',
        backgroundColor: '#EFF6FF',
        icon: 'help',
    },
]
