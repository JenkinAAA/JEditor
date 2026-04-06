import { ICONS } from './shared/icon-set.js'

const controllerMap = new WeakMap()

function iconHTML(iconDef) {
  if (!iconDef) return ''
  if (iconDef.startsWith('<')) return iconDef
  if (window.feather?.icons[iconDef]) {
    return window.feather.icons[iconDef].toSvg({ width: 16, height: 16 })
  }
  return ''
}

function createItem(plugin, editor, context, controller) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'je-insert-item'
  const hasSubmenu = plugin.toolbar?.dropdown || typeof plugin.renderPopover === 'function'
  const label =
    plugin.name === 'blockquote'
      ? '添加引用'
      : plugin.toolbar?.text || plugin.toolbar?.title || plugin.name
  button.innerHTML = `
        <span class="je-insert-item-main">
            <span class="je-insert-item-icon">${iconHTML(plugin.toolbar?.icon)}</span>
            <span>${label}</span>
        </span>
        ${hasSubmenu ? `<span class="je-insert-item-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg></span>` : ''}
    `

  if (hasSubmenu && typeof plugin.renderPopover === 'function') {
    button.addEventListener('mouseenter', () => {
      const nested = plugin.renderPopover(editor, {
        closePopover: context.closePopover,
        closeNestedPopover: context.closeNestedPopover,
        openNestedPopover: context.openNestedPopover,
      })
      if (nested) {
        context.openNestedPopover(nested, button)
      }
    })
  } else {
    button.addEventListener('click', () => {
      context.closePopover()
      plugin.command?.(editor)
      controller?.sync?.()
    })
  }

  return button
}

export default {
  name: 'more',
  toolbar: {
    icon: ICONS.more,
    title: '更多',
    dropdown: true,
  },
  tiptapExtension: null,
  init(editor, config = {}) {
    controllerMap.set(editor, config.controller || null)
  },
  command: () => {},
  isActive: () => false,
  renderPopover(editor, context) {
    const controller = controllerMap.get(editor)
    const popover = document.createElement('div')
    popover.className = 'je-popover je-insert-popover'

    const pluginNames = controller?.getItems?.() || []
    pluginNames.forEach((name) => {
      const plugin = controller?.pluginManager?.get(name)
      if (!plugin) return
      popover.appendChild(createItem(plugin, editor, context, controller))
    })

    return popover
  },
}
