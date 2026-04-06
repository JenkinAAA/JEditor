import { Callout } from '../extensions/callout.js'
import {
  CALLOUT_TYPES,
  getCalloutIconMarkup,
  getCalloutTypeConfig,
} from './shared/style-presets.js'

function getDefaultType() {
  return CALLOUT_TYPES[0]
}

function getType(value) {
  return getCalloutTypeConfig(value)
}

function findCurrentType(editor) {
  if (editor.isActive('callout')) {
    return getType(editor.getAttributes('callout').type)
  }

  return getDefaultType()
}

function createPopover(editor, context) {
  const popover = document.createElement('div')
  popover.className = 'je-popover je-popover-list'

  CALLOUT_TYPES.forEach((typeDef) => {
    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'je-callout-item'

    const badge = document.createElement('span')
    badge.className = 'je-callout-badge'
    badge.innerHTML =
      getCalloutIconMarkup(typeDef) || '<span class="je-callout-badge-text">D</span>'
    badge.style.color = typeDef.textColor
    badge.style.background = typeDef.backgroundColor

    const content = document.createElement('span')
    content.className = 'je-callout-content'

    const label = document.createElement('span')
    label.className = 'je-callout-label'
    label.textContent = typeDef.label

    const short = document.createElement('span')
    short.className = 'je-callout-short'
    short.textContent = typeDef.shortLabel

    content.append(label, short)
    item.append(badge, content)
    item.addEventListener('click', () => {
      if (editor.isActive('callout')) {
        editor.chain().focus().setCalloutType(typeDef.value).run()
      } else {
        editor.chain().focus().insertCallout({ type: typeDef.value }).run()
      }

      context.closePopover()
    })

    popover.appendChild(item)
  })

  return popover
}

export default {
  name: 'callout',
  toolbar: {
    type: 'color',
    text: 'C',
    title: 'Callout',
    textColor: getDefaultType().textColor,
    backgroundColor: getDefaultType().backgroundColor,
  },
  tiptapExtension: Callout,
  command: (editor) => {
    editor.chain().focus().insertCallout({ type: getDefaultType().value }).run()
  },
  isActive: (editor) => editor.isActive('callout'),
  getToolbarState: (editor) => {
    const type = findCurrentType(editor)
    return {
      textColor: type.textColor,
      backgroundColor: type.backgroundColor,
    }
  },
  renderPopover(editor, context) {
    return createPopover(editor, context)
  },
}
