import { NodeSelection } from '@tiptap/pm/state'
import { TableKit } from '@tiptap/extension-table'

const MOVE_ICON = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="12" r="1.2" fill="currentColor"/>
        <circle cx="9" cy="5" r="1.2" fill="currentColor"/>
        <circle cx="9" cy="19" r="1.2" fill="currentColor"/>
        <circle cx="15" cy="12" r="1.2" fill="currentColor"/>
        <circle cx="15" cy="5" r="1.2" fill="currentColor"/>
        <circle cx="15" cy="19" r="1.2" fill="currentColor"/>
    </svg>
`

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

function getTableWrapper(table) {
    return table.closest('.tableWrapper')
}

function getTableContext(editor, wrapper) {
    if (!wrapper) return null
    const table = wrapper.querySelector('table')
    if (!table) return null

    const tablePos = editor.view.posAtDOM(wrapper, 0)
    const tableNode = editor.state.doc.nodeAt(tablePos)
    if (!tableNode || tableNode.type.name !== 'table') return null

    const rows = []
    tableNode.forEach((rowNode, rowOffset) => {
        const rowPos = tablePos + 1 + rowOffset
        const cells = []
        rowNode.forEach((cellNode, cellOffset, index) => {
            cells.push({
                pos: rowPos + 1 + cellOffset,
                node: cellNode,
                index,
            })
        })
        rows.push({
            pos: rowPos,
            node: rowNode,
            index: rows.length,
            cells,
        })
    })

    return { table, tableNode, tablePos, rows }
}

function updateTableStyle(editor, wrapper, patch) {
    const context = getTableContext(editor, wrapper)
    if (!context) return
    const { tableNode, tablePos } = context
    const nextStyle = patchStyle(tableNode.attrs.style, patch)
    editor.view.dispatch(
        editor.state.tr.setNodeMarkup(tablePos, undefined, {
            ...tableNode.attrs,
            style: nextStyle,
        }),
    )
}

function updateCellStyles(editor, wrapper, predicate, patch) {
    const context = getTableContext(editor, wrapper)
    if (!context) return

    const { rows } = context
    let tr = editor.state.tr
    let changed = false

    rows.forEach((row, rowIndex) => {
        row.cells.forEach((cell, colIndex) => {
            if (!predicate({ row, rowIndex, cell, colIndex })) return
            const nextStyle = patchStyle(cell.node.attrs.style, patch({ row, rowIndex, cell, colIndex }))
            if (nextStyle === (cell.node.attrs.style || null)) return
            tr = tr.setNodeMarkup(cell.pos, undefined, {
                ...cell.node.attrs,
                style: nextStyle,
            })
            changed = true
        })
    })

    if (changed) {
        editor.view.dispatch(tr)
    }
}

function selectTableNode(editor, wrapper) {
    const pos = editor.view.posAtDOM(wrapper, 0)
    editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)))
    editor.view.focus()
}

function focusCellAndRun(editor, cellPos, commandName) {
    const chain = editor.chain().focus().setTextSelection(cellPos + 1)
    if (typeof chain[commandName] === 'function') {
        chain[commandName]().run()
    }
}

function ensureBaseTableStyle(editor, wrapper) {
    const context = getTableContext(editor, wrapper)
    if (!context) return
    const { tableNode, tablePos } = context
    const styleText = tableNode.attrs.style || ''
    if (/width\s*:/i.test(styleText)) return

    editor.view.dispatch(
        editor.state.tr.setNodeMarkup(tablePos, undefined, {
            ...tableNode.attrs,
            style: patchStyle(styleText, {
                width: '100%',
            }),
        }),
    )
}

function refreshOverlay(editor, wrapper, overlay) {
    const table = wrapper.querySelector('table');
    if (!table) return;
    // 检查表格是否真的在文档中且可见
    if (table.offsetWidth === 0) return;

    const tableRect = table.getBoundingClientRect()
    const wrapperRect = wrapper.getBoundingClientRect()
    const firstRow = table.querySelector('tr')
    if (!firstRow) return
    const firstRowCells = Array.from(firstRow.children)
    const rows = Array.from(table.querySelectorAll('tr'))

    overlay.innerHTML = ''

    const moveHandle = document.createElement('button')
    moveHandle.type = 'button'
    moveHandle.className = 'je-table-move-handle'
    moveHandle.innerHTML = MOVE_ICON
    moveHandle.style.top = `${tableRect.top - wrapperRect.top + 8}px`
    moveHandle.style.left = `${tableRect.left - wrapperRect.left - 22}px`
    moveHandle.addEventListener('mousedown', (event) => {
        event.preventDefault()
        selectTableNode(editor, wrapper)
    })
    overlay.appendChild(moveHandle)

    const resizeHandle = document.createElement('div')
    resizeHandle.className = 'je-table-resize-handle'
    resizeHandle.style.left = `${tableRect.right - wrapperRect.left - 8}px`
    resizeHandle.style.top = `${tableRect.bottom - wrapperRect.top - 8}px`
    overlay.appendChild(resizeHandle)

    let startX = 0
    let startY = 0
    let startWidth = 0
    let startHeight = 0

    const onResizeMove = (event) => {
        const width = Math.max(240, startWidth + (event.clientX - startX))
        const height = Math.max(28, startHeight + (event.clientY - startY))
        updateTableStyle(editor, wrapper, { width: `${width}px` })
        updateCellStyles(
            editor,
            wrapper,
            () => true,
            () => ({ height: `${height}px` }),
        )
    }

    const onResizeUp = () => {
        window.removeEventListener('pointermove', onResizeMove)
        window.removeEventListener('pointerup', onResizeUp)
    }

    resizeHandle.addEventListener('pointerdown', (event) => {
        event.preventDefault()
        const firstCell = table.querySelector('th, td')
        startX = event.clientX
        startY = event.clientY
        startWidth = table.getBoundingClientRect().width
        startHeight = firstCell ? firstCell.getBoundingClientRect().height : 36
        window.addEventListener('pointermove', onResizeMove)
        window.addEventListener('pointerup', onResizeUp)
    })

    firstRowCells.forEach((cell, colIndex) => {
        const cellRect = cell.getBoundingClientRect()
        const handle = document.createElement('div')
        handle.className = 'je-table-col-handle'
        handle.style.left = `${cellRect.right - wrapperRect.left - 3}px`
        handle.style.top = `${tableRect.top - wrapperRect.top}px`
        handle.style.height = `${tableRect.height}px`

        const plus = document.createElement('button')
        plus.type = 'button'
        plus.className = 'je-table-add-control je-table-add-control--column'
        plus.textContent = '+'
        plus.style.left = `${cellRect.right - wrapperRect.left - 8}px`
        plus.style.top = `${tableRect.top - wrapperRect.top - 12}px`

        const context = getTableContext(editor, wrapper)
        const targetCellPos = context?.rows?.[0]?.cells?.[colIndex]?.pos
        plus.addEventListener('mousedown', (event) => {
            event.preventDefault()
            event.stopPropagation()
            if (targetCellPos != null) {
                focusCellAndRun(editor, targetCellPos, 'addColumnAfter')
            }
        })

        let colStartX = 0
        let startWidthPx = 0

        const onColMove = (event) => {
            const nextWidth = Math.max(60, startWidthPx + (event.clientX - colStartX))
            updateTableStyle(editor, wrapper, { width: `${table.getBoundingClientRect().width}px` })
            updateCellStyles(
                editor,
                wrapper,
                ({ colIndex: currentColIndex }) => currentColIndex === colIndex,
                () => ({ width: `${nextWidth}px` }),
            )
        }

        const onColUp = () => {
            window.removeEventListener('pointermove', onColMove)
            window.removeEventListener('pointerup', onColUp)
        }

        handle.addEventListener('pointerdown', (event) => {
            event.preventDefault()
            colStartX = event.clientX
            startWidthPx = cellRect.width
            window.addEventListener('pointermove', onColMove)
            window.addEventListener('pointerup', onColUp)
        })

        overlay.append(handle, plus)
    })

    rows.forEach((row, rowIndex) => {
        const firstCell = row.children[0]
        if (!firstCell) return
        const rowRect = row.getBoundingClientRect()

        const handle = document.createElement('div')
        handle.className = 'je-table-row-handle'
        handle.style.left = `${tableRect.left - wrapperRect.left}px`
        handle.style.top = `${rowRect.bottom - wrapperRect.top - 3}px`
        handle.style.width = `${tableRect.width}px`

        const plus = document.createElement('button')
        plus.type = 'button'
        plus.className = 'je-table-add-control je-table-add-control--row'
        plus.textContent = '+'
        plus.style.left = `${tableRect.left - wrapperRect.left - 12}px`
        plus.style.top = `${rowRect.bottom - wrapperRect.top - 8}px`

        const context = getTableContext(editor, wrapper)
        const targetCellPos = context?.rows?.[rowIndex]?.cells?.[0]?.pos
        plus.addEventListener('mousedown', (event) => {
            event.preventDefault()
            event.stopPropagation()
            if (targetCellPos != null) {
                focusCellAndRun(editor, targetCellPos, 'addRowAfter')
            }
        })

        let rowStartY = 0
        let startHeightPx = 0

        const onRowMove = (event) => {
            const nextHeight = Math.max(28, startHeightPx + (event.clientY - rowStartY))
            updateCellStyles(
                editor,
                wrapper,
                ({ rowIndex: currentRowIndex }) => currentRowIndex === rowIndex,
                () => ({ height: `${nextHeight}px` }),
            )
        }

        const onRowUp = () => {
            window.removeEventListener('pointermove', onRowMove)
            window.removeEventListener('pointerup', onRowUp)
        }

        handle.addEventListener('pointerdown', (event) => {
            event.preventDefault()
            rowStartY = event.clientY
            startHeightPx = rowRect.height
            window.addEventListener('pointermove', onRowMove)
            window.addEventListener('pointerup', onRowUp)
        })

        overlay.append(handle, plus)
    })
}

function ensureHandles(editor) {
    const wrappers = editor.view.dom.querySelectorAll('.tableWrapper')
    wrappers.forEach((wrapper) => {
        wrapper.classList.add('je-table-wrap')
        ensureBaseTableStyle(editor, wrapper)

        let overlay = wrapper.querySelector('.je-table-overlay')
        if (!overlay) {
            overlay = document.createElement('div')
            overlay.className = 'je-table-overlay'
            wrapper.appendChild(overlay)
        }

        refreshOverlay(editor, wrapper, overlay)
    })
}

export function insertTable(editor, rows = 4, cols = 8) {
    editor.chain().focus().insertTable({
        rows,
        cols,
        withHeaderRow: true,
    }).run()
}

export default {
    name: 'table',
    toolbar: {
        icon: 'grid',
        title: '表格',
    },
    tiptapExtension: TableKit.configure({
        resizable: false,
        table: {
            HTMLAttributes: {
                class: 'je-table',
                style: 'width:100%;',
            },
            renderWrapper: true,
            allowTableNodeSelection: true,
            cellMinWidth: 80,
        },
    }),
    command: (editor) => {
        if (editor.isActive('table')) {
            const shouldDelete = window.confirm('当前已在表格中，是否删除整个表格？')
            if (shouldDelete) {
                editor.chain().focus().deleteTable().run()
            }
            return
        }

        insertTable(editor, 4, 8)
    },
    isActive: (editor) => editor.isActive('table'),
    init(editor) {
        let ticking = false;
        const sync = () => {
            if (editor.view.composing || ticking) return;

            ticking = true;
            window.requestAnimationFrame(() => {
                ensureHandles(editor);
                ticking = false;
            });
        };
        editor.on('update', sync)
        editor.on('selectionUpdate', sync)
        window.addEventListener('resize', sync)
        this._cleanup = () => {
            editor.off('update', sync)
            editor.off('selectionUpdate', sync)
            window.removeEventListener('resize', sync)
        }
    },
    destroy() {
        this._cleanup?.()
        this._cleanup = null
    },
}
