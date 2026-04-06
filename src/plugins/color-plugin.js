import { TextColor } from '../extensions/text-color.js'
import { HighlightColor } from '../extensions/highlight-color.js'
import { TEXT_COLOR_PRESETS, HIGHLIGHT_COLOR_PRESETS } from './shared/style-presets.js'
import { createColorPopover } from './shared/popover-factory.js'

const DEFAULT_TEXT_COLOR = '#EF4444'

function normalizeColor(value, fallback = null) {
  if (!value) return fallback
  const normalized = value.trim().toUpperCase()
  if (/^#[0-9A-F]{6}$/.test(normalized)) return normalized
  const rgbMatch = normalized.match(/^RGBA?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch
    return `#${[r, g, b]
      .map((item) => Number(item).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`
  }
  return fallback
}

function createColorState() {
  return {
    currentTextColor: null,
    currentHighlightColor: null,
    recentStyles: [],
  }
}

const stateMap = new WeakMap()

function getState(editor) {
  if (!stateMap.has(editor)) {
    stateMap.set(editor, createColorState())
  }
  return stateMap.get(editor)
}

function getCurrentStyle(editor, state) {
  const attrText = normalizeColor(editor.getAttributes('textColor').color, null)
  const attrBg = normalizeColor(editor.getAttributes('highlightColor').backgroundColor, null)

  const textColor = attrText ?? state.currentTextColor ?? null
  const backgroundColor = attrBg ?? state.currentHighlightColor ?? null

  if (attrText !== null) state.currentTextColor = attrText
  if (attrBg !== null) state.currentHighlightColor = attrBg

  return { textColor, backgroundColor }
}

function pushRecentStyle(state, style) {
  if (!style?.textColor && !style?.backgroundColor) return

  const normalized = {
    textColor: normalizeColor(style.textColor, DEFAULT_TEXT_COLOR),
    backgroundColor: normalizeColor(style.backgroundColor, null),
  }

  state.recentStyles = [
    normalized,
    ...state.recentStyles.filter(
      (item) =>
        item.textColor !== normalized.textColor ||
        item.backgroundColor !== normalized.backgroundColor,
    ),
  ].slice(0, 5)
}

function applyStyle(editor, style, close = null) {
  const state = getState(editor)
  const chain = editor.chain().focus()
  let appliedText = state.currentTextColor
  let appliedBg = state.currentHighlightColor

  if ('textColor' in style) {
    const textColor = normalizeColor(style.textColor, null)
    if (textColor) {
      chain.setTextColor(textColor)
      appliedText = textColor
      state.currentTextColor = textColor
    } else {
      chain.unsetTextColor()
      appliedText = null
      state.currentTextColor = null
    }
  }

  if ('backgroundColor' in style) {
    const backgroundColor = normalizeColor(style.backgroundColor, null)
    if (backgroundColor) {
      chain.setHighlightColor(backgroundColor)
      appliedBg = backgroundColor
      state.currentHighlightColor = backgroundColor
    } else {
      chain.unsetHighlightColor()
      appliedBg = null
      state.currentHighlightColor = null
    }
  }

  chain.run()
  const latest = getCurrentStyle(editor, state)
  pushRecentStyle(state, {
    textColor: latest.textColor ?? appliedText,
    backgroundColor: latest.backgroundColor ?? appliedBg,
  })

  if (typeof close === 'function') {
    close()
  }
}

function clearStyle(editor, close = null) {
  const state = getState(editor)
  editor.chain().focus().unsetTextColor().unsetHighlightColor().run()
  state.currentTextColor = null
  state.currentHighlightColor = null
  if (typeof close === 'function') {
    close()
  }
}

function buildPopover(editor, context) {
  const state = getState(editor)

  return createColorPopover(
    {
      previewText: 'A',
      textColors: TEXT_COLOR_PRESETS,
      backgroundColors: HIGHLIGHT_COLOR_PRESETS,
      getRecentStyles: () => state.recentStyles,
      getCurrentColor: (targetEditor, mode) => {
        const current = getCurrentStyle(targetEditor, state)
        return mode === 'background'
          ? current.backgroundColor || '#FFFFFF'
          : current.textColor || DEFAULT_TEXT_COLOR
      },
      applyColor: (targetEditor, mode, color, ctx) => {
        if (mode === 'text') {
          applyStyle(targetEditor, { textColor: color }, ctx.closePopover)
        } else {
          applyStyle(targetEditor, { backgroundColor: color }, ctx.closePopover)
        }
      },
      applyStyle: (targetEditor, style, ctx) => {
        applyStyle(targetEditor, style, ctx.closePopover)
      },
      clearStyle: (targetEditor, ctx) => {
        clearStyle(targetEditor, ctx.closePopover)
      },
    },
    {
      editor,
      closePopover: context.closePopover,
    },
  )
}

export const textColorPlugin = {
  name: 'textColor',
  toolbar: {
    type: 'color',
    text: 'A',
    title: '颜色',
    textColor: null,
    backgroundColor: 'transparent',
  },
  tiptapExtension: [TextColor, HighlightColor],
  command: (editor) => {
    const state = getState(editor)
    applyStyle(editor, {
      textColor: state.currentTextColor || DEFAULT_TEXT_COLOR,
      backgroundColor: state.currentHighlightColor,
    })
  },
  isActive: (editor) => editor.isActive('textColor') || editor.isActive('highlightColor'),
  getToolbarState: (editor) => {
    const style = getCurrentStyle(editor, getState(editor))
    return {
      textColor: style.textColor || null,
      backgroundColor: style.backgroundColor || 'transparent',
    }
  },
  renderPopover(editor, context) {
    return buildPopover(editor, context)
  },
}
