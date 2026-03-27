import { Callout } from '../extensions/callout.js'
import { CALLOUT_TYPES } from './shared/style-presets.js'

const stateMap = new WeakMap()

function getDefaultType() {
    return CALLOUT_TYPES[0]
}

function getState(editor) {
    if (!stateMap.has(editor)) {
        stateMap.set(editor, { currentType: getDefaultType().value })
    }
    return stateMap.get(editor)
}

function getType(value) {
    return CALLOUT_TYPES.find((item) => item.value === value) || getDefaultType()
}

function findCurrentType(editor) {
    if (editor.isActive('callout')) {
        return getType(editor.getAttributes('callout').type)
    }
    return getType(getState(editor).currentType)
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
        badge.textContent = 'C'
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
            const state = getState(editor)
            state.currentType = typeDef.value

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
        const type = getType(getState(editor).currentType)
        editor.chain().focus().insertCallout({ type: type.value }).run()
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
