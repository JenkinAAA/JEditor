// src/plugins/index.js
// 所有内置 plugin 统一导出

export { default as bold } from './bold.js'
export { default as italic } from './italic.js'
export { default as underline } from './underline.js'
export { default as strike } from './strike.js'
export { default as undo } from './undo.js'
export { default as redo } from './redo.js'
export { default as clearFormat } from './clear-format.js'
export { default as formatPainter } from './format-painter.js'
export { default as insertImage } from './image/index.js'

import boldPlugin from './bold.js'
import italicPlugin from './italic.js'
import underlinePlugin from './underline.js'
import strikePlugin from './strike.js'
import undoPlugin from './undo.js'
import redoPlugin from './redo.js'
import clearFormatPlugin from './clear-format.js'
import formatPainterPlugin from './format-painter.js'
import insertImagePlugin from './image/index.js'
import { placeholderPlugins } from './placeholders.js'

/**
 * 所有内置 plugin（已实现 + 占位）
 */
export const builtinPlugins = [
    undoPlugin,
    redoPlugin,
    boldPlugin,
    italicPlugin,
    underlinePlugin,
    strikePlugin,
    clearFormatPlugin,
    formatPainterPlugin,
    insertImagePlugin,
    ...placeholderPlugins,
]
