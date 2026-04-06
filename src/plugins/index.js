export { default as bold } from './bold.js'
export { default as italic } from './italic.js'
export { default as underline } from './underline.js'
export { default as strike } from './strike.js'
export { default as undo } from './undo.js'
export { default as redo } from './redo.js'
export { default as clearFormat } from './clear-format.js'
export { default as formatPainter } from './format-painter.js'
export { default as insertImage } from './image/index.js'
export { default as insert } from './insert.js'
export { default as exportPdf } from './export-pdf.js'
export { default as fullscreen } from './fullscreen.js'
export { default as source } from './source.js'
export { default as htmlPreservation } from './html-preservation.js'
export { default as rawHtmlBlock } from './raw-html-block.js'
export { default as align } from './align.js'
export { default as lineHeight } from './line-height.js'
export { default as more } from './more.js'
export { default as heading } from './heading.js'
export { default as fontFamily } from './font-family.js'
export { textColorPlugin as textColor } from './color-plugin.js'
export { default as callout } from './callout.js'
export { default as bulletList } from './bullet-list.js'
export { default as orderedList } from './ordered-list.js'
export { default as blockquote } from './blockquote.js'
export { default as inlineCode } from './inline-code.js'
export { default as codeBlock } from './code-block.js'
export { default as link } from './link.js'
export { default as table } from './table.js'

import boldPlugin from './bold.js'
import italicPlugin from './italic.js'
import underlinePlugin from './underline.js'
import strikePlugin from './strike.js'
import undoPlugin from './undo.js'
import redoPlugin from './redo.js'
import clearFormatPlugin from './clear-format.js'
import formatPainterPlugin from './format-painter.js'
import insertImagePlugin from './image/index.js'
import insertPlugin from './insert.js'
import exportPdfPlugin from './export-pdf.js'
import fullscreenPlugin from './fullscreen.js'
import sourcePlugin from './source.js'
import htmlPreservationPlugin from './html-preservation.js'
import rawHtmlBlockPlugin from './raw-html-block.js'
import alignPlugin from './align.js'
import lineHeightPlugin from './line-height.js'
import morePlugin from './more.js'
import headingPlugin from './heading.js'
import fontFamilyPlugin from './font-family.js'
import fontSizePlugin from './font-size.js'
import { textColorPlugin } from './color-plugin.js'
import calloutPlugin from './callout.js'
import bulletListPlugin from './bullet-list.js'
import orderedListPlugin from './ordered-list.js'
import blockquotePlugin from './blockquote.js'
import inlineCodePlugin from './inline-code.js'
import codeBlockPlugin from './code-block.js'
import linkPlugin from './link.js'
import tablePlugin from './table.js'
import horizontalRulePlugin from './horizontal-rule.js'
import { placeholderPlugins } from './placeholders.js'

export const builtinPlugins = [
  htmlPreservationPlugin,
  horizontalRulePlugin,
  undoPlugin,
  redoPlugin,
  formatPainterPlugin,
  clearFormatPlugin,
  insertPlugin,
  exportPdfPlugin,
  morePlugin,
  fullscreenPlugin,
  sourcePlugin,
  headingPlugin,
  fontFamilyPlugin,
  fontSizePlugin,
  boldPlugin,
  italicPlugin,
  underlinePlugin,
  strikePlugin,
  textColorPlugin,
  rawHtmlBlockPlugin,
  calloutPlugin,
  bulletListPlugin,
  orderedListPlugin,
  alignPlugin,
  lineHeightPlugin,
  blockquotePlugin,
  inlineCodePlugin,
  codeBlockPlugin,
  linkPlugin,
  tablePlugin,
  insertImagePlugin,
  ...placeholderPlugins,
]
