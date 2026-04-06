import { Table, TableCell, TableHeader, TableRow, TableView } from '@tiptap/extension-table'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'

export const TABLE_DRAG_START_EVENT = 'je-table-drag-start'
export const TABLE_DRAG_END_EVENT = 'je-table-drag-end'

const DRAG_HANDLE_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="12" r="1"/>
        <circle cx="9" cy="5" r="1"/>
        <circle cx="9" cy="19" r="1"/>
        <circle cx="15" cy="12" r="1"/>
        <circle cx="15" cy="5" r="1"/>
        <circle cx="15" cy="19" r="1"/>
    </svg>
`

const ROW_CONTROL_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="1.5"/>
        <circle cx="12" cy="12" r="1.5"/>
        <circle cx="12" cy="19" r="1.5"/>
    </svg>
`

const COLUMN_CONTROL_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="12" r="1.5"/>
        <circle cx="12" cy="12" r="1.5"/>
        <circle cx="19" cy="12" r="1.5"/>
    </svg>
`

const MIN_ROW_HEIGHT = 28
const MIN_TABLE_HEIGHT = 100

const TABLE_WRAPPER_STYLE = [
  'overflow-x:auto',
  'overflow-y:hidden',
  'width:100%',
  'max-width:100%',
  'margin:1em 0',
  'padding:0',
].join(';')

const TABLE_BASE_STYLE = [
  'width:100%',
  'margin:0',
  'border-collapse:collapse',
  'table-layout:fixed',
  'background:#fff',
].join(';')

const TABLE_CELL_BASE_STYLE = [
  'min-width:80px',
  'height:auto',
  'padding:8px 10px',
  'border:1px solid #e5e7eb',
  'vertical-align:top',
  'line-height:1.5',
  'overflow:hidden',
].join(';')

const TABLE_HEADER_BASE_STYLE = [
  TABLE_CELL_BASE_STYLE,
  'background:#f8fafc',
  'font-weight:600',
  'color:#374151',
  'border-color:#dbe3ec',
].join(';')

const AXIS_ACTIONS = {
  row: [
    { label: 'Insert Row Before', command: 'addRowBefore' },
    { label: 'Insert Row After', command: 'addRowAfter' },
    { label: 'Delete Row', command: 'deleteRow' },
  ],
  column: [
    { label: 'Insert Column Before', command: 'addColumnBefore' },
    { label: 'Insert Column After', command: 'addColumnAfter' },
    { label: 'Delete Column', command: 'deleteColumn' },
  ],
}

function combineStyles(...styles) {
  return styles.filter(Boolean).join(';')
}

function mergeClassNames(...classNames) {
  const merged = []

  classNames
    .flatMap((value) => String(value || '').split(/\s+/))
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      if (!merged.includes(value)) {
        merged.push(value)
      }
    })

  return merged.join(' ') || null
}

function decorateTableSpec(spec) {
  if (!Array.isArray(spec) || typeof spec[0] !== 'string') {
    return spec
  }

  const [tagName, maybeAttrs, ...rest] = spec
  const hasAttrs =
    Boolean(maybeAttrs) && typeof maybeAttrs === 'object' && !Array.isArray(maybeAttrs)
  const attrs = hasAttrs ? { ...maybeAttrs } : {}
  const children = (hasAttrs ? rest : [maybeAttrs, ...rest]).map((child) =>
    decorateTableSpec(child),
  )

  if (tagName === 'th') {
    attrs.style = combineStyles(TABLE_HEADER_BASE_STYLE, attrs.style)
  } else if (tagName === 'td') {
    attrs.style = combineStyles(TABLE_CELL_BASE_STYLE, attrs.style)
  }

  return [tagName, attrs, ...children]
}

function patchStyle(styleText = '', patch = {}) {
  const element = document.createElement('div')
  element.setAttribute('style', styleText || '')
  Object.entries(patch).forEach(([key, value]) => {
    if (value == null || value === '') {
      element.style.removeProperty(key)
    } else {
      element.style.setProperty(key, value)
    }
  })
  return element.getAttribute('style') || null
}

function collectTableContext(tableNode, tablePos) {
  const rows = []
  tableNode.forEach((rowNode, rowOffset) => {
    const rowPos = tablePos + 1 + rowOffset
    const cells = []
    let colIndex = 0
    rowNode.forEach((cellNode, cellOffset) => {
      const colspan = cellNode.attrs.colspan || 1
      cells.push({
        pos: rowPos + 1 + cellOffset,
        node: cellNode,
        colIndex,
        colspan,
      })
      colIndex += colspan
    })
    rows.push({
      pos: rowPos,
      node: rowNode,
      cells,
    })
  })
  return rows
}

function syncTableAttributes(tableElement, htmlAttributes = {}, node) {
  const className = htmlAttributes.class || ''
  const baseStyle = htmlAttributes.style || ''
  const nodeStyle = node?.attrs?.style || ''
  const styles = [baseStyle, nodeStyle].filter(Boolean).join(';')

  if (className) {
    tableElement.className = className
  } else {
    tableElement.removeAttribute('class')
  }

  if (styles) {
    tableElement.style.cssText = styles
  } else {
    tableElement.removeAttribute('style')
  }
}

function readHeightFromStyle(styleText = '') {
  const element = document.createElement('div')
  element.setAttribute('style', styleText || '')
  return element.style.getPropertyValue('height') || null
}

function readElementHeight(element) {
  if (!element) return 0
  const rectHeight = element.getBoundingClientRect?.().height || 0
  if (rectHeight > 0) return rectHeight

  const inlineHeight = parseFloat(element.style.height || '')
  if (Number.isFinite(inlineHeight) && inlineHeight > 0) {
    return inlineHeight
  }

  return element.offsetHeight || 0
}

function buildScaledRowHeights(startRowHeights, nextTotalHeight) {
  if (!Array.isArray(startRowHeights) || !startRowHeights.length) {
    return []
  }

  const safeStartHeights = startRowHeights.map((height) => Math.max(MIN_ROW_HEIGHT, height || 0))
  const startTotalHeight = safeStartHeights.reduce((sum, height) => sum + height, 0)
  if (!startTotalHeight) {
    return safeStartHeights
  }

  const minimumTotalHeight = Math.max(MIN_TABLE_HEIGHT, safeStartHeights.length * MIN_ROW_HEIGHT)
  const safeNextTotalHeight = Math.max(minimumTotalHeight, nextTotalHeight)
  const scale = safeNextTotalHeight / startTotalHeight

  return safeStartHeights.map((height) => Math.max(MIN_ROW_HEIGHT, height * scale))
}

function applyRowHeightsToDOM(rowElements, rowHeights) {
  rowElements.forEach((rowElement, index) => {
    const nextHeight = rowHeights[index]
    if (!rowElement || !Number.isFinite(nextHeight)) return
    rowElement.style.height = `${nextHeight}px`
  })
}

class TableResizer {
  constructor({
    editor,
    wrapper,
    contentDOM,
    resizeHandle,
    getPos,
    getCurrentNode,
    selectNode,
    closeAxisPopover,
    extensionName,
  }) {
    this.editor = editor
    this.wrapper = wrapper
    this.contentDOM = contentDOM
    this.resizeHandle = resizeHandle
    this.getPos = getPos
    this.getCurrentNode = getCurrentNode
    this.selectNode = selectNode
    this.closeAxisPopover = closeAxisPopover
    this.extensionName = extensionName

    this._session = null
    this._ghost = null

    this._handleMouseDown = this._handleMouseDown.bind(this)
    this._handleMouseMove = this._handleMouseMove.bind(this)
    this._handleMouseUp = this._handleMouseUp.bind(this)
    this._handleWindowBlur = this._handleWindowBlur.bind(this)

    this.resizeHandle.addEventListener('mousedown', this._handleMouseDown)
  }

  isActive() {
    return Boolean(this._session)
  }

  destroy() {
    this.resizeHandle.removeEventListener('mousedown', this._handleMouseDown)
    this._teardownSession(false)
  }

  _ensureGhost() {
    if (this._ghost) return this._ghost

    const ghost = document.createElement('div')
    ghost.className = 'je-table-resize-ghost'

    const line = document.createElement('div')
    line.className = 'je-table-resize-ghost__line'

    ghost.appendChild(line)
    this.wrapper.appendChild(ghost)
    this._ghost = ghost
    return ghost
  }

  _setGhostVisible(visible, totalHeight = 0) {
    const ghost = this._ensureGhost()
    ghost.classList.toggle('is-visible', visible)
    if (visible && totalHeight > 0) {
      ghost.style.height = `${totalHeight}px`
    }
  }

  _getSnapshot() {
    const tablePos = this.getPos()
    if (typeof tablePos !== 'number') return null

    const tableNode = this.getCurrentNode()
    if (!tableNode || tableNode.type.name !== this.extensionName) return null

    const rows = collectTableContext(tableNode, tablePos)
    const rowElements = Array.from(this.contentDOM.querySelectorAll('tr'))
    if (!rows.length || rows.length !== rowElements.length) return null

    const startRowHeights = rowElements.map((rowElement) =>
      Math.max(MIN_ROW_HEIGHT, readElementHeight(rowElement)),
    )
    const startTotalHeight = startRowHeights.reduce((sum, height) => sum + height, 0)

    return {
      rows,
      rowElements,
      startRowHeights,
      previewRowHeights: startRowHeights,
      startTotalHeight,
      tablePos,
      startY: 0,
      hasMoved: false,
    }
  }

  _handleMouseDown(event) {
    if (event.button !== 0) return

    const snapshot = this._getSnapshot()
    if (!snapshot) return

    event.preventDefault()
    event.stopPropagation()

    this.closeAxisPopover?.()
    this.selectNode?.()

    snapshot.startY = event.clientY
    this._session = snapshot

    this.wrapper.classList.add('is-resizing')
    document.body.classList.add('je-table-resizing')
    this._setGhostVisible(true, snapshot.startTotalHeight)

    window.addEventListener('mousemove', this._handleMouseMove)
    window.addEventListener('mouseup', this._handleMouseUp)
    window.addEventListener('blur', this._handleWindowBlur)
  }

  _handleMouseMove(event) {
    if (!this._session) return

    event.preventDefault()

    const deltaY = event.clientY - this._session.startY
    const nextTotalHeight = this._session.startTotalHeight + deltaY
    const previewRowHeights = buildScaledRowHeights(this._session.startRowHeights, nextTotalHeight)

    this._session.hasMoved = this._session.hasMoved || Math.abs(deltaY) > 0.5
    this._session.previewRowHeights = previewRowHeights
    applyRowHeightsToDOM(this._session.rowElements, previewRowHeights)
    const previewTotalHeight = previewRowHeights.reduce((sum, height) => sum + height, 0)
    this._setGhostVisible(true, previewTotalHeight)
  }

  _handleMouseUp(event) {
    if (!this._session) return
    event.preventDefault()
    this._commitResize()
  }

  _handleWindowBlur() {
    if (!this._session) return
    this._commitResize()
  }

  _commitResize() {
    if (!this._session) return
    if (!this._session.hasMoved) {
      this._teardownSession(false)
      return
    }

    const tablePos = this.getPos()
    const tableNode = typeof tablePos === 'number' ? this.editor.state.doc.nodeAt(tablePos) : null
    if (!tableNode || tableNode.type.name !== this.extensionName) {
      this._teardownSession(false)
      return
    }

    const rows = collectTableContext(tableNode, tablePos)
    const previewRowHeights = this._session.previewRowHeights || this._session.startRowHeights
    let tr = this.editor.state.tr
    let changed = false

    rows.forEach((row, rowIndex) => {
      const nextHeight = Math.max(
        MIN_ROW_HEIGHT,
        Math.round(previewRowHeights[rowIndex] || MIN_ROW_HEIGHT),
      )
      const nextRowStyle = patchStyle(row.node.attrs.style, {
        height: `${nextHeight}px`,
      })

      if ((row.node.attrs.style || null) !== nextRowStyle) {
        tr = tr.setNodeMarkup(row.pos, undefined, {
          ...row.node.attrs,
          style: nextRowStyle,
        })
        changed = true
      }

      row.cells.forEach((cell) => {
        const nextCellStyle = patchStyle(cell.node.attrs.style, {
          height: null,
        })

        if ((cell.node.attrs.style || null) !== nextCellStyle) {
          tr = tr.setNodeMarkup(cell.pos, undefined, {
            ...cell.node.attrs,
            style: nextCellStyle,
          })
          changed = true
        }
      })
    })

    if (changed) {
      this.editor.view.dispatch(tr)
    }

    this._teardownSession(true)
  }

  _teardownSession(keepPreview) {
    window.removeEventListener('mousemove', this._handleMouseMove)
    window.removeEventListener('mouseup', this._handleMouseUp)
    window.removeEventListener('blur', this._handleWindowBlur)

    if (this._session && !keepPreview) {
      applyRowHeightsToDOM(this._session.rowElements, this._session.startRowHeights)
    }

    this.wrapper.classList.remove('is-resizing')
    document.body.classList.remove('je-table-resizing')
    this._setGhostVisible(false)
    this._session = null
  }
}

export const CustomTable = Table.extend({
  draggable: true,

  addProseMirrorPlugins() {
    return []
  },

  renderHTML({ node, HTMLAttributes }) {
    const rendered = this.parent?.({ node, HTMLAttributes })
    if (!Array.isArray(rendered)) {
      return rendered
    }

    const [, wrapperAttrs = {}, tableSpec] = rendered
    if (!Array.isArray(tableSpec) || tableSpec[0] !== 'table') {
      return rendered
    }

    const [, tableAttrs = {}, ...tableChildren] = tableSpec

    return [
      'div',
      {
        ...wrapperAttrs,
        'data-jeditor-table-wrapper': '',
        class: mergeClassNames(wrapperAttrs.class, 'je-table-wrap'),
        style: combineStyles(TABLE_WRAPPER_STYLE, wrapperAttrs.style),
      },
      [
        'table',
        {
          ...tableAttrs,
          class: mergeClassNames(tableAttrs.class, 'je-table'),
          style: combineStyles(TABLE_BASE_STYLE, tableAttrs.style),
        },
        ...tableChildren.map((child) => decorateTableSpec(child)),
      ],
    ]
  },

  addNodeView() {
    const cellMinWidth = this.options.cellMinWidth
    const htmlAttributes = this.options.HTMLAttributes || {}
    const extensionName = this.name

    return ({ node, editor, getPos }) => {
      const tableView = new TableView(node, cellMinWidth)
      const wrapper = document.createElement('div')
      wrapper.className = 'je-table-node'
      let currentNode = node

      const dragHandle = document.createElement('button')
      dragHandle.type = 'button'
      dragHandle.className = 'je-table-drag-handle'
      dragHandle.tabIndex = -1
      dragHandle.innerHTML = DRAG_HANDLE_ICON

      const resizeHandle = document.createElement('button')
      resizeHandle.type = 'button'
      resizeHandle.className = 'je-table-resize-handle'
      resizeHandle.tabIndex = -1

      const rowControl = document.createElement('button')
      rowControl.type = 'button'
      rowControl.className = 'je-table-axis-control je-table-axis-control--row'
      rowControl.tabIndex = -1
      rowControl.innerHTML = ROW_CONTROL_ICON

      const columnControl = document.createElement('button')
      columnControl.type = 'button'
      columnControl.className = 'je-table-axis-control je-table-axis-control--column'
      columnControl.tabIndex = -1
      columnControl.innerHTML = COLUMN_CONTROL_ICON

      wrapper.append(dragHandle, tableView.dom, rowControl, columnControl, resizeHandle)
      syncTableAttributes(tableView.table, htmlAttributes, node)

      let delegateDragToEditor = false
      let hoveredCellElement = null
      let hoveredCellPos = null
      let isPointerInside = false
      let isRowControlHovered = false
      let isColumnControlHovered = false
      let isPopoverHovered = false
      let axisPopover = null

      const selectNode = () => {
        const pos = getPos()
        if (typeof pos !== 'number') return

        const { state, view } = editor
        view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
        view.focus()
      }

      const resetDragDelegation = () => {
        delegateDragToEditor = false
        document.removeEventListener('dragend', resetDragDelegation, false)
        document.removeEventListener('mouseup', resetDragDelegation, false)
      }

      const closeAxisPopover = () => {
        if (!axisPopover) return
        axisPopover.remove()
        axisPopover = null
        isPopoverHovered = false
        document.removeEventListener('mousedown', handleOutsidePopoverClick, true)
        window.removeEventListener('scroll', closeAxisPopover, true)
        window.removeEventListener('resize', closeAxisPopover, true)
        updateControlVisibility()
      }

      const updateControlVisibility = () => {
        const showRowControl =
          hoveredCellElement && (isPointerInside || isRowControlHovered || isPopoverHovered)
        const showColumnControl =
          hoveredCellElement && (isPointerInside || isColumnControlHovered || isPopoverHovered)

        rowControl.classList.toggle('is-visible', showRowControl)
        columnControl.classList.toggle('is-visible', showColumnControl)
      }

      const positionAxisControls = (cellElement) => {
        if (!cellElement) return

        const wrapperRect = wrapper.getBoundingClientRect()
        const cellRect = cellElement.getBoundingClientRect()

        rowControl.style.top = `${cellRect.top - wrapperRect.top + cellRect.height / 2 - 12}px`
        rowControl.style.left = '-28px'

        columnControl.style.top = '-28px'
        columnControl.style.left = `${cellRect.left - wrapperRect.left + cellRect.width / 2 - 12}px`
      }

      const getCellSelectionPos = (cellElement) => {
        if (!cellElement) return null

        try {
          const cellPos = editor.view.posAtDOM(cellElement, 0)
          return TextSelection.near(editor.state.doc.resolve(cellPos + 1)).from
        } catch {
          return null
        }
      }

      const getHoveredRowIndex = () => {
        const rowElement = hoveredCellElement?.closest?.('tr')
        if (!rowElement) return null
        return Array.from(tableView.contentDOM.querySelectorAll('tr')).indexOf(rowElement)
      }

      const setHoveredCell = (cellElement) => {
        if (!cellElement) return
        hoveredCellElement = cellElement
        hoveredCellPos = getCellSelectionPos(cellElement)
        positionAxisControls(cellElement)
        updateControlVisibility()
      }

      const canRunAxisCommand = (commandName) => {
        if (hoveredCellPos == null) return false
        const canChain = editor.can().chain().focus().setTextSelection(hoveredCellPos)
        if (typeof canChain[commandName] !== 'function') return false
        return canChain[commandName]().run()
      }

      const syncInsertedRowHeight = (commandName, referenceRowIndex) => {
        if (referenceRowIndex == null) return
        if (commandName !== 'addRowBefore' && commandName !== 'addRowAfter') return

        const tablePos = getPos()
        if (typeof tablePos !== 'number') return

        const tableNode = editor.state.doc.nodeAt(tablePos)
        if (!tableNode || tableNode.type.name !== extensionName) return

        const rows = collectTableContext(tableNode, tablePos)
        const insertedRowIndex =
          commandName === 'addRowBefore' ? referenceRowIndex : referenceRowIndex + 1
        const referenceSourceIndex =
          commandName === 'addRowBefore' ? referenceRowIndex + 1 : referenceRowIndex
        const referenceRow = rows[referenceSourceIndex]
        const insertedRow = rows[insertedRowIndex]

        if (!referenceRow || !insertedRow) return

        const nextHeight = readHeightFromStyle(referenceRow.node.attrs.style) || null
        let tr = editor.state.tr
        let changed = false

        if (nextHeight) {
          tr = tr.setNodeMarkup(insertedRow.pos, undefined, {
            ...insertedRow.node.attrs,
            style: patchStyle(insertedRow.node.attrs.style, {
              height: nextHeight,
            }),
          })
          changed = true
        }

        if (changed) {
          editor.view.dispatch(tr)
        }
      }

      const runAxisCommand = (commandName) => {
        if (hoveredCellPos == null) return
        if (!canRunAxisCommand(commandName)) return
        const referenceRowIndex = getHoveredRowIndex()

        const chain = editor.chain().focus().setTextSelection(hoveredCellPos)
        if (typeof chain[commandName] === 'function') {
          chain[commandName]().run()
          syncInsertedRowHeight(commandName, referenceRowIndex)
        }

        closeAxisPopover()
      }

      const handleOutsidePopoverClick = (event) => {
        if (
          axisPopover?.contains(event.target) ||
          rowControl.contains(event.target) ||
          columnControl.contains(event.target)
        )
          return
        closeAxisPopover()
        isPopoverHovered = false
        updateControlVisibility()
      }

      const openAxisPopover = (axis, anchor) => {
        closeAxisPopover()

        const popover = document.createElement('div')
        popover.className = 'je-popover je-table-axis-popover'
        const list = document.createElement('div')
        list.className = 'je-popover-list'

        const actions = AXIS_ACTIONS[axis] || []

        actions.forEach((action) => {
          const item = document.createElement('button')
          item.type = 'button'
          item.className = 'je-popover-item'
          item.textContent = action.label
          if (!canRunAxisCommand(action.command)) {
            item.classList.add('is-muted')
            item.disabled = true
          }
          item.addEventListener('click', () => runAxisCommand(action.command))
          list.appendChild(item)
        })

        popover.appendChild(list)
        popover.addEventListener('mouseenter', () => {
          isPopoverHovered = true
          updateControlVisibility()
        })
        popover.addEventListener('mouseleave', () => {
          isPopoverHovered = false
          updateControlVisibility()
        })

        document.body.appendChild(popover)
        const rect = anchor.getBoundingClientRect()
        popover.style.top = `${rect.bottom + window.scrollY + 8}px`
        popover.style.left = `${Math.max(12, rect.left + window.scrollX - 8)}px`

        axisPopover = popover
        isPopoverHovered = true
        updateControlVisibility()

        document.addEventListener('mousedown', handleOutsidePopoverClick, true)
        window.addEventListener('scroll', closeAxisPopover, true)
        window.addEventListener('resize', closeAxisPopover, true)
      }

      const tableResizer = new TableResizer({
        editor,
        wrapper,
        contentDOM: tableView.contentDOM,
        resizeHandle,
        getPos,
        getCurrentNode: () => currentNode,
        selectNode,
        closeAxisPopover,
        extensionName,
      })

      dragHandle.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return
        delegateDragToEditor = true
        selectNode()
        document.addEventListener('dragend', resetDragDelegation, false)
        document.addEventListener('mouseup', resetDragDelegation, false)
      })

      dragHandle.addEventListener('dragstart', (event) => {
        if (!delegateDragToEditor) {
          event.preventDefault()
          return
        }

        const sourcePos = getPos()
        if (typeof sourcePos !== 'number') {
          event.preventDefault()
          return
        }

        selectNode()
        wrapper.classList.add('is-dragging')
        event.dataTransfer?.setData('application/x-jeditor-table-drag', 'true')
        event.dataTransfer?.setData('text/plain', 'table')
        event.dataTransfer?.setDragImage(wrapper, 24, 24)
        editor.view.dom.dispatchEvent(
          new CustomEvent(TABLE_DRAG_START_EVENT, {
            bubbles: true,
            detail: {
              wrapper,
              sourcePos,
            },
          }),
        )
      })

      dragHandle.addEventListener('dragend', () => {
        wrapper.classList.remove('is-dragging')
        editor.view.dom.dispatchEvent(
          new CustomEvent(TABLE_DRAG_END_EVENT, {
            bubbles: true,
          }),
        )
        resetDragDelegation()
      })

      dragHandle.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        selectNode()
      })

      rowControl.addEventListener('mouseenter', () => {
        isRowControlHovered = true
        updateControlVisibility()
      })
      rowControl.addEventListener('mouseleave', () => {
        isRowControlHovered = false
        updateControlVisibility()
      })
      columnControl.addEventListener('mouseenter', () => {
        isColumnControlHovered = true
        updateControlVisibility()
      })
      columnControl.addEventListener('mouseleave', () => {
        isColumnControlHovered = false
        updateControlVisibility()
      })

      rowControl.addEventListener('mousedown', (event) => {
        event.preventDefault()
        event.stopPropagation()
      })
      columnControl.addEventListener('mousedown', (event) => {
        event.preventDefault()
        event.stopPropagation()
      })
      rowControl.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        openAxisPopover('row', rowControl)
      })
      columnControl.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        openAxisPopover('column', columnControl)
      })

      wrapper.addEventListener('mousemove', (event) => {
        if (tableResizer.isActive()) return
        isPointerInside = true
        const cellElement = event.target.closest?.('td, th')
        if (cellElement && tableView.contentDOM.contains(cellElement)) {
          setHoveredCell(cellElement)
        } else {
          updateControlVisibility()
        }
      })

      wrapper.addEventListener('mouseleave', () => {
        isPointerInside = false
        updateControlVisibility()
      })

      return {
        dom: wrapper,
        contentDOM: tableView.contentDOM,
        update(updatedNode) {
          if (updatedNode.type.name !== extensionName) return false
          currentNode = updatedNode
          syncTableAttributes(tableView.table, htmlAttributes, updatedNode)
          return tableView.update(updatedNode)
        },
        selectNode() {
          wrapper.classList.add('ProseMirror-selectednode', 'is-selected')
        },
        deselectNode() {
          wrapper.classList.remove(
            'ProseMirror-selectednode',
            'is-selected',
            'is-dragging',
            'is-resizing',
          )
          resetDragDelegation()
        },
        stopEvent(event) {
          const fromHandle = dragHandle.contains(event.target)
          const fromResizeHandle = resizeHandle.contains(event.target)

          if (fromResizeHandle) {
            return true
          }

          if (fromHandle && event.type === 'mousedown') {
            return false
          }

          if (
            delegateDragToEditor &&
            /dragstart|dragover|dragenter|drop|dragend/.test(event.type)
          ) {
            return false
          }

          if (fromHandle) {
            return true
          }

          if (rowControl.contains(event.target) || columnControl.contains(event.target)) {
            return true
          }

          return false
        },
        ignoreMutation(mutation) {
          const target = mutation.target
          if (
            tableResizer.isActive() &&
            mutation.type === 'attributes' &&
            mutation.attributeName === 'style' &&
            tableView.contentDOM.contains(target)
          ) {
            return true
          }

          if (wrapper.contains(target) && !tableView.contentDOM.contains(target)) {
            return true
          }

          return tableView.ignoreMutation?.(mutation) ?? false
        },
        destroy() {
          tableResizer.destroy()
          closeAxisPopover()
          resetDragDelegation()
          editor.view.dom.dispatchEvent(
            new CustomEvent(TABLE_DRAG_END_EVENT, {
              bubbles: true,
            }),
          )
        },
      }
    }
  },
})

export const TableExtensions = [
  CustomTable.configure({
    resizable: false,
    HTMLAttributes: {
      class: 'je-table',
      style: 'width:100%;',
    },
    renderWrapper: true,
    allowTableNodeSelection: true,
    cellMinWidth: 80,
  }),
  TableRow,
  TableHeader,
  TableCell,
]
