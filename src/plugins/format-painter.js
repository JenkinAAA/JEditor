import { NodeSelection } from '@tiptap/pm/state'
import { ICONS } from './shared/icon-set.js'

const BRUSH_CURSOR = 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTcuMyAzLjNjLS43LS43LTEuOS0uNy0yLjYgMEw2LjEgMTEuOUw0LjkgMTZsNC4xLTEuMmw4LjYtOC42Yy43LS43LjctMS45IDAtMi42ek04LjIgMTUuN2wtMS45LjUgLjUtMS45bDguNi04LjZsMS40IDEuNC04LjYgOC42eiIgZmlsbD0iIzE3Mjc0MiIvPjwvc3ZnPg==") 0 16, auto'

function createState() {
    return {
        active: false,
        sticky: false,
        snapshot: null,
        sourceRange: null,
        applying: false,
        mouseupHandler: null,
        keydownHandler: null,
    }
}

const stateMap = new WeakMap()

function getState(editor) {
    if (!stateMap.has(editor)) {
        stateMap.set(editor, createState())
    }
    return stateMap.get(editor)
}

function captureSnapshot(editor) {
    const headingAttrs = editor.getAttributes('heading')

    return {
        block: editor.isActive('heading') && headingAttrs.level
            ? { type: 'heading', level: headingAttrs.level }
            : { type: 'paragraph' },
        marks: {
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            strike: editor.isActive('strike'),
            fontFamily: editor.getAttributes('fontFamily').fontFamily || null,
            textColor: editor.getAttributes('textColor').color || null,
            highlightColor: editor.getAttributes('highlightColor').color || null,
        },
    }
}

function setCursor(editor, enabled) {
    const dom = editor.view.dom
    if (!dom) return
    dom.style.cursor = enabled ? BRUSH_CURSOR : ''
    document.body.style.cursor = enabled ? BRUSH_CURSOR : ''
}

function deactivate(editor) {
    const state = getState(editor)
    state.active = false
    state.sticky = false
    state.snapshot = null
    state.sourceRange = null
    setCursor(editor, false)
}

function applyMarks(chain, snapshot) {
    snapshot.marks.bold ? chain.setBold() : chain.unsetBold()
    snapshot.marks.italic ? chain.setItalic() : chain.unsetItalic()
    snapshot.marks.underline ? chain.setUnderline() : chain.unsetUnderline()
    snapshot.marks.strike ? chain.setStrike() : chain.unsetStrike()

    snapshot.marks.fontFamily
        ? chain.setFontFamily(snapshot.marks.fontFamily)
        : chain.unsetFontFamily()

    snapshot.marks.textColor
        ? chain.setTextColor(snapshot.marks.textColor)
        : chain.unsetTextColor()

    snapshot.marks.highlightColor
        ? chain.setHighlightColor(snapshot.marks.highlightColor)
        : chain.unsetHighlightColor()
}

function applySnapshot(editor, snapshot, selection) {
    if (!snapshot) return
    const chain = editor.chain().focus()

    const isBlockSelection = selection instanceof NodeSelection && selection.node?.isBlock
    if (isBlockSelection) {
        if (snapshot.block.type === 'heading') {
            chain.setHeading({ level: snapshot.block.level })
        } else {
            chain.setParagraph()
        }
    }

    applyMarks(chain, snapshot)
    chain.run()
}

function activate(editor, sticky) {
    const { selection } = editor.state
    if (selection.empty) return

    const state = getState(editor)

    if (state.active && !sticky) {
        deactivate(editor)
        return
    }

    state.snapshot = captureSnapshot(editor)
    state.sourceRange = { from: selection.from, to: selection.to }
    state.active = true
    state.sticky = sticky
    setCursor(editor, true)
}

function attemptApply(editor) {
    const state = getState(editor)
    const { selection } = editor.state

    if (!state.active || state.applying || selection.empty) return

    if (
        state.sourceRange
        && selection.from === state.sourceRange.from
        && selection.to === state.sourceRange.to
    ) {
        return
    }

    state.applying = true
    applySnapshot(editor, state.snapshot, selection)
    state.applying = false

    if (!state.sticky) {
        deactivate(editor)
    }
}

export default {
    name: 'formatPainter',
    toolbar: {
        icon: ICONS.formatPainter,
        title: '格式刷',
    },
    tiptapExtension: null,
    command: (editor) => activate(editor, false),
    onDoubleClick: (editor) => activate(editor, true),
    isActive: (editor) => getState(editor).active,
    init(editor) {
        const state = getState(editor)

        state.mouseupHandler = () => attemptApply(editor)
        state.keydownHandler = (e) => {
            if (e.key === 'Escape') {
                deactivate(editor)
            }
        }

        const doc = editor.view.dom.ownerDocument
        doc.addEventListener('mouseup', state.mouseupHandler, true)
        doc.addEventListener('keydown', state.keydownHandler, true)
    },
    destroy(editor) {
        const state = getState(editor)
        const doc = editor?.view?.dom?.ownerDocument
        if (doc) {
            doc.removeEventListener('mouseup', state.mouseupHandler, true)
            doc.removeEventListener('keydown', state.keydownHandler, true)
        }
        deactivate(editor)
    },
}
