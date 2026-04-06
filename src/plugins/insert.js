import { openLinkEditor } from './link.js'
import { insertTable } from './table.js'
import { ICONS } from './shared/icon-set.js'

const CHEVRON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>'
const TABLE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 10h16"/><path d="M9 5v14"/><path d="M15 5v14"/></svg>'

function buildNumberInput(defaultValue) {
  const input = document.createElement('input')
  input.type = 'number'
  input.min = '1'
  input.max = '99'
  input.value = String(defaultValue)
  input.className = 'je-insert-table-number'
  return input
}

function createTablePicker(editor, context) {
  const panel = document.createElement('div')
  panel.className = 'je-popover je-insert-table-panel'

  const title = document.createElement('div')
  title.className = 'je-insert-table-title'
  title.textContent = '插入表格'

  const grid = document.createElement('div')
  grid.className = 'je-insert-table-grid'

  const info = document.createElement('div')
  info.className = 'je-insert-table-info'
  info.textContent = '0 x 0'

  const custom = document.createElement('div')
  custom.className = 'je-insert-table-custom'

  const rowsInput = buildNumberInput(4)
  const colsInput = buildNumberInput(8)

  const rowsLabel = document.createElement('label')
  rowsLabel.className = 'je-insert-table-custom-field'
  rowsLabel.innerHTML = '<span>行</span>'
  rowsLabel.appendChild(rowsInput)

  const colsLabel = document.createElement('label')
  colsLabel.className = 'je-insert-table-custom-field'
  colsLabel.innerHTML = '<span>列</span>'
  colsLabel.appendChild(colsInput)

  const confirm = document.createElement('button')
  confirm.type = 'button'
  confirm.className = 'je-insert-table-confirm'
  confirm.textContent = '插入'
  confirm.addEventListener('click', () => {
    insertTable(editor, Number(rowsInput.value) || 1, Number(colsInput.value) || 1)
    context.closePopover()
  })

  custom.append(rowsLabel, colsLabel, confirm)

  let activeCols = 0
  let activeRows = 0

  const paintGrid = () => {
    Array.from(grid.children).forEach((cell, index) => {
      const col = (index % 10) + 1
      const row = Math.floor(index / 10) + 1
      cell.classList.toggle(
        'is-active',
        activeCols > 0 && activeRows > 0 && col <= activeCols && row <= activeRows,
      )
    })
    info.textContent = `${activeCols} x ${activeRows}`
  }

  for (let row = 1; row <= 8; row += 1) {
    for (let col = 1; col <= 10; col += 1) {
      const cell = document.createElement('button')
      cell.type = 'button'
      cell.className = 'je-insert-table-cell'
      cell.addEventListener('mouseenter', () => {
        activeCols = col
        activeRows = row
        paintGrid()
      })
      cell.addEventListener('click', () => {
        insertTable(editor, activeRows, activeCols)
        context.closePopover()
      })
      grid.appendChild(cell)
    }
  }

  grid.addEventListener('mouseleave', () => {
    activeCols = 0
    activeRows = 0
    paintGrid()
  })

  paintGrid()
  panel.append(title, grid, info, custom)
  return panel
}

function createItem(item, popover, _context) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'je-insert-item'
  button.innerHTML = `
        <span class="je-insert-item-main">
            <span class="je-insert-item-icon">${item.icon || ''}</span>
            <span>${item.label}</span>
        </span>
        ${item.hasSubmenu ? `<span class="je-insert-item-arrow">${CHEVRON_SVG}</span>` : ''}
    `

  if (item.hasSubmenu) {
    button.addEventListener('mouseenter', () => item.onHover(button))
  } else {
    button.addEventListener('click', item.onClick)
  }

  popover.appendChild(button)
}

export default {
  name: 'insert',
  toolbar: {
    text: '插入',
    title: '插入',
    dropdown: true,
  },
  tiptapExtension: null,
  command: () => {},
  isActive: () => false,
  renderPopover(editor, context) {
    const popover = document.createElement('div')
    popover.className = 'je-popover je-insert-popover'

    const items = [
      {
        label: '表格',
        icon: TABLE_ICON,
        hasSubmenu: true,
        onHover(anchor) {
          context.openNestedPopover(createTablePicker(editor, context), anchor)
        },
      },
      {
        label: '链接',
        icon: ICONS.link,
        onClick() {
          context.closePopover()
          openLinkEditor(editor)
        },
      },
      {
        label: 'HTML Block',
        icon: ICONS.htmlBlock,
        onClick() {
          context.closePopover()
          editor.chain().focus().insertRawHtmlIsland('<div>\n  Raw HTML\n</div>').run()
        },
      },
    ]

    items.forEach((item) => createItem(item, popover, context))

    return popover
  },
}
