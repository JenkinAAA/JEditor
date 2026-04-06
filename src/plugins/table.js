import { NodeSelection } from '@tiptap/pm/state'
import {
  TableExtensions,
  TABLE_DRAG_END_EVENT,
  TABLE_DRAG_START_EVENT,
} from '../extensions/table.js'

const cleanupMap = new WeakMap()

function ensureDropIndicator(root) {
  let indicator = root.querySelector('.je-table-drop-indicator')
  if (!indicator) {
    indicator = document.createElement('div')
    indicator.className = 'je-table-drop-indicator'
    root.appendChild(indicator)
  }
  return indicator
}

function hideDropIndicator(indicator) {
  indicator?.classList.remove('is-visible')
}

function getTopLevelNodePos(view, element) {
  if (!(element instanceof HTMLElement)) return null

  try {
    const pos = view.posAtDOM(element, 0)
    const $pos = view.state.doc.resolve(pos)
    if ($pos.depth < 1) return null

    return $pos.before(1)
  } catch {
    return null
  }
}

function buildDropTarget(root, view, indicator, clientY, draggedWrapper) {
  const rootRect = root.getBoundingClientRect()
  const blocks = Array.from(root.children).filter((element) => {
    if (!(element instanceof HTMLElement)) return false
    if (element === indicator) return false
    if (element.classList.contains('ProseMirror-gapcursor')) return false
    return true
  })

  if (!blocks.length) {
    return {
      top: 0,
      pos: 0,
      side: 'before',
      element: null,
    }
  }

  let target = null

  for (const block of blocks) {
    if (block === draggedWrapper) continue
    const rect = block.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const pos = getTopLevelNodePos(view, block)
    if (typeof pos !== 'number') continue

    if (clientY < midpoint) {
      target = {
        element: block,
        pos,
        side: 'before',
        top: rect.top - rootRect.top,
      }
      break
    }
  }

  if (!target) {
    const lastBlock =
      [...blocks].reverse().find((block) => block !== draggedWrapper) || blocks[blocks.length - 1]
    const rect = lastBlock.getBoundingClientRect()
    const pos = getTopLevelNodePos(view, lastBlock)
    if (typeof pos !== 'number') return null

    target = {
      element: lastBlock,
      pos,
      side: 'after',
      top: rect.bottom - rootRect.top,
    }
  }

  return target
}

function updateDropIndicator(indicator, target) {
  if (!target) {
    hideDropIndicator(indicator)
    return
  }

  indicator.style.top = `${Math.max(0, target.top)}px`
  indicator.classList.add('is-visible')
}

function moveTableNode(editor, sourcePos, target) {
  if (!target || typeof sourcePos !== 'number') return false

  const { state, view } = editor
  const sourceNode = state.doc.nodeAt(sourcePos)
  if (!sourceNode || sourceNode.type.name !== 'table') return false

  const targetNode = state.doc.nodeAt(target.pos)
  if (!targetNode) return false

  let insertPos = target.side === 'after' ? target.pos + targetNode.nodeSize : target.pos

  if (target.pos === sourcePos) {
    if (target.side === 'before') return false
    insertPos = sourcePos + sourceNode.nodeSize
  }

  if (insertPos === sourcePos || insertPos === sourcePos + sourceNode.nodeSize) {
    return false
  }

  let tr = state.tr.delete(sourcePos, sourcePos + sourceNode.nodeSize)
  if (insertPos > sourcePos) {
    insertPos -= sourceNode.nodeSize
  }

  tr = tr.insert(insertPos, sourceNode)
  tr = tr.setSelection(NodeSelection.create(tr.doc, insertPos))
  view.dispatch(tr.scrollIntoView())
  return true
}

export function insertTable(editor, rows = 4, cols = 8) {
  editor
    .chain()
    .focus()
    .insertTable({
      rows,
      cols,
      withHeaderRow: true,
    })
    .run()
}

export default {
  name: 'table',
  toolbar: {
    icon: 'grid',
    title: 'Table',
  },
  tiptapExtension: TableExtensions,
  command: (editor) => {
    if (editor.isActive('table')) {
      const shouldDelete = window.confirm('Delete the current table?')
      if (shouldDelete) {
        editor.chain().focus().deleteTable().run()
      }
      return
    }

    insertTable(editor, 4, 8)
  },
  isActive: (editor) => editor.isActive('table'),
  init(editor) {
    const root = editor.view.dom
    const indicator = ensureDropIndicator(root)
    let activeDrag = null

    const handleDragStart = (event) => {
      activeDrag = {
        wrapper: event.detail?.wrapper || null,
        sourcePos: event.detail?.sourcePos ?? null,
        target: null,
      }
    }

    const handleDragOver = (event) => {
      if (!activeDrag) return
      event.preventDefault()
      const target = buildDropTarget(
        root,
        editor.view,
        indicator,
        event.clientY,
        activeDrag.wrapper,
      )
      activeDrag.target = target
      updateDropIndicator(indicator, target)
    }

    const handleDragLeave = (event) => {
      if (!activeDrag) return
      if (event.relatedTarget && root.contains(event.relatedTarget)) return
      hideDropIndicator(indicator)
    }

    const clearIndicator = () => {
      activeDrag = null
      hideDropIndicator(indicator)
    }

    const handleDrop = (event) => {
      if (!activeDrag) return
      event.preventDefault()
      event.stopPropagation()

      if (activeDrag.target) {
        moveTableNode(editor, activeDrag.sourcePos, activeDrag.target)
      }

      clearIndicator()
    }

    root.addEventListener(TABLE_DRAG_START_EVENT, handleDragStart)
    root.addEventListener(TABLE_DRAG_END_EVENT, clearIndicator)
    root.addEventListener('dragover', handleDragOver, true)
    root.addEventListener('drop', handleDrop, true)
    root.addEventListener('dragleave', handleDragLeave, true)

    cleanupMap.set(editor, () => {
      root.removeEventListener(TABLE_DRAG_START_EVENT, handleDragStart)
      root.removeEventListener(TABLE_DRAG_END_EVENT, clearIndicator)
      root.removeEventListener('dragover', handleDragOver, true)
      root.removeEventListener('drop', handleDrop, true)
      root.removeEventListener('dragleave', handleDragLeave, true)
      hideDropIndicator(indicator)
      indicator.remove()
      activeDrag = null
    })
  },
  destroy(editor) {
    cleanupMap.get(editor)?.()
    cleanupMap.delete(editor)
  },
}
