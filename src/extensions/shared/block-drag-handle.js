import { NodeSelection } from '@tiptap/pm/state'

export const BLOCK_DRAG_HANDLE_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="12" r="1"/>
        <circle cx="9" cy="5" r="1"/>
        <circle cx="9" cy="19" r="1"/>
        <circle cx="15" cy="12" r="1"/>
        <circle cx="15" cy="5" r="1"/>
        <circle cx="15" cy="19" r="1"/>
    </svg>
`

export function createNodeSelector(editor, getPos) {
  return () => {
    const pos = getPos()
    if (typeof pos !== 'number') return false

    const { state, view } = editor
    view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
    view.focus()
    return true
  }
}

export function bindBlockDragHandle({ _editor, getPos, wrapper, handle, selectNode }) {
  let isDragging = false
  let delegateDragToEditor = false

  const resetDragDelegation = () => {
    delegateDragToEditor = false
    document.removeEventListener('dragend', resetDragDelegation, false)
    document.removeEventListener('mouseup', resetDragDelegation, false)
  }

  const onMouseDown = (event) => {
    if (event.button !== 0) return
    delegateDragToEditor = true
    selectNode?.()
    document.addEventListener('dragend', resetDragDelegation, false)
    document.addEventListener('mouseup', resetDragDelegation, false)
  }

  const onDragStart = (event) => {
    if (!delegateDragToEditor) {
      event.preventDefault()
      return
    }

    const pos = getPos()
    if (typeof pos !== 'number') {
      event.preventDefault()
      return
    }

    selectNode?.()
    isDragging = true
    wrapper.classList.add('is-dragging')
    event.dataTransfer?.setData('text/plain', 'block')
    event.dataTransfer?.setDragImage(wrapper, 24, 24)
  }

  const onDragEnd = () => {
    isDragging = false
    wrapper.classList.remove('is-dragging')
    resetDragDelegation()
  }

  const onClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    selectNode?.()
  }

  handle.addEventListener('mousedown', onMouseDown)
  handle.addEventListener('dragstart', onDragStart)
  handle.addEventListener('dragend', onDragEnd)
  handle.addEventListener('click', onClick)

  return {
    isDragging: () => isDragging,
    stopEvent(event) {
      const fromHandle = handle.contains(event.target)

      if (fromHandle && event.type === 'mousedown') {
        return false
      }

      if (delegateDragToEditor && /dragstart|dragover|dragenter|drop|dragend/.test(event.type)) {
        return false
      }

      if (fromHandle) {
        return true
      }

      return false
    },
    destroy() {
      handle.removeEventListener('mousedown', onMouseDown)
      handle.removeEventListener('dragstart', onDragStart)
      handle.removeEventListener('dragend', onDragEnd)
      handle.removeEventListener('click', onClick)
      resetDragDelegation()
    },
  }
}
