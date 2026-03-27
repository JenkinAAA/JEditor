const CHEVRON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'

const ROW_CLASSES = [
    'je-toolbar-row je-toolbar-row--primary',
    'je-toolbar-row je-toolbar-row--secondary',
]

function iconHTML(iconDef) {
    if (!iconDef) return null
    if (iconDef.startsWith('<')) return iconDef
    if (window.feather?.icons[iconDef]) {
        return window.feather.icons[iconDef].toSvg({ width: 20, height: 20 })
    }
    return null
}

function createColorButton(plugin) {
    const wrapper = document.createElement('div')
    wrapper.className = 'je-color-group'
    wrapper.dataset.commandGroup = plugin.name
    wrapper.dataset.pluginName = plugin.name

    const main = document.createElement('button')
    main.type = 'button'
    main.className = 'tool-btn'
    main.dataset.command = plugin.name
    main.title = plugin.toolbar.title || ''
    main.innerHTML = `
        <span class="je-color-inner">
            <span class="je-color-chip" style="background:${plugin.toolbar.backgroundColor || 'transparent'}">
                <span class="je-color-char" style="color:${plugin.toolbar.textColor || '#111827'}">${plugin.toolbar.text || 'A'}</span>
            </span>
        </span>
    `

    const arrow = document.createElement('button')
    arrow.type = 'button'
    arrow.className = 'tool-btn-arrow-down'
    arrow.dataset.commandToggle = plugin.name
    arrow.innerHTML = CHEVRON_SVG

    wrapper.append(main, arrow)
    return wrapper
}

function createDropdownButton(plugin) {
    const btn = document.createElement('button')
    btn.type = 'button'
    const hasIcon = Boolean(plugin.toolbar.icon)
    const hasText = Boolean(plugin.toolbar.text)
    btn.className = hasIcon && hasText ? 'tool-btn-text tool-btn-text--icon' : (hasIcon ? 'tool-btn' : 'tool-btn-text')
    btn.dataset.commandToggle = plugin.name
    btn.dataset.pluginName = plugin.name
    btn.title = plugin.toolbar.title || ''
    const svg = iconHTML(plugin.toolbar.icon)
    if (svg && hasText) {
        btn.innerHTML = `${svg}<span>${plugin.toolbar.text}</span>`
    } else if (svg) {
        btn.innerHTML = svg
    } else {
        btn.innerHTML = `${plugin.toolbar.text || ''} ${CHEVRON_SVG}`
    }
    return btn
}

function createRegularButton(plugin) {
    const hasIcon = Boolean(plugin.toolbar.icon)
    const hasText = Boolean(plugin.toolbar.text)
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = hasIcon && hasText ? 'tool-btn-text tool-btn-text--icon' : 'tool-btn'

    if (plugin.toolbar.className) {
        btn.className += ` ${plugin.toolbar.className}`
    }

    btn.dataset.command = plugin.name
    btn.dataset.pluginName = plugin.name
    btn.title = plugin.toolbar.shortcut
        ? `${plugin.toolbar.title} (${plugin.toolbar.shortcut})`
        : (plugin.toolbar.title || '')

    const svg = iconHTML(plugin.toolbar.icon)
    if (svg && hasText) {
        btn.innerHTML = `${svg}<span>${plugin.toolbar.text}</span>`
    } else if (svg) {
        btn.innerHTML = svg
    } else {
        btn.textContent = plugin.toolbar.text || ''
    }

    return btn
}

function createButton(plugin) {
    if (plugin.toolbar.type === 'color') return createColorButton(plugin)
    if (plugin.toolbar.dropdown) return createDropdownButton(plugin)
    return createRegularButton(plugin)
}

function createSeparator() {
    const el = document.createElement('div')
    el.className = 'v-divider'
    el.dataset.role = 'separator'
    return el
}

function createSpacer() {
    const el = document.createElement('div')
    el.className = 'je-spacer'
    el.dataset.role = 'spacer'
    return el
}

function positionPopover(popover, anchorEl, side = 'bottom') {
    const rect = anchorEl.getBoundingClientRect()
    const popoverRect = popover.getBoundingClientRect()
    const top = side === 'right'
        ? rect.top + window.scrollY
        : rect.bottom + window.scrollY + 8
    const left = side === 'right'
        ? rect.right + window.scrollX + 8
        : Math.max(12, rect.left + window.scrollX)

    popover.style.top = `${top}px`
    popover.style.left = `${Math.min(left, window.scrollX + window.innerWidth - popoverRect.width - 12)}px`
}

function updateDropdownButton(containerEl, pluginName, state, fallbackText) {
    const button = containerEl.querySelector(`[data-command-toggle="${pluginName}"]`)
    if (!button) return
    if (!button.classList.contains('tool-btn-text')) return

    const label = state?.label || fallbackText || ''
    button.innerHTML = `${label} ${CHEVRON_SVG}`
}

function updateColorButton(containerEl, pluginName, state, fallback) {
    const group = containerEl.querySelector(`[data-command-group="${pluginName}"]`)
    if (!group) return

    const chip = group.querySelector('.je-color-chip')
    const character = group.querySelector('.je-color-char')
    if (chip) {
        chip.style.background = state?.backgroundColor || fallback?.backgroundColor || 'transparent'
    }
    if (character) {
        character.style.color = state?.textColor || fallback?.textColor || '#111827'
    }
}

function updateRegularButton(containerEl, plugin, state) {
    if (!state?.icon && !state?.text && !state?.title) return

    const button = containerEl.querySelector(`[data-command="${plugin.name}"], [data-command-toggle="${plugin.name}"]`)
    if (!button) return

    const icon = state.icon || plugin.toolbar.icon
    const text = state.text ?? plugin.toolbar.text
    const title = state.title ?? plugin.toolbar.title ?? ''
    const svg = iconHTML(icon)
    const hasIcon = Boolean(icon)
    const hasText = Boolean(text)

    button.title = title

    if (button.classList.contains('tool-btn-text')) {
        if (svg && hasText) {
            button.innerHTML = `${svg}<span>${text}</span>`
        } else if (svg) {
            button.innerHTML = svg
        } else {
            button.textContent = text || ''
        }
        return
    }

    if (svg) {
        button.innerHTML = svg
    }
}

function getOuterWidth(element) {
    if (!element || element.classList.contains('is-overflow-hidden')) return 0
    const styles = window.getComputedStyle(element)
    if (styles.display === 'none') return 0
    return element.getBoundingClientRect().width
        + parseFloat(styles.marginLeft || '0')
        + parseFloat(styles.marginRight || '0')
}

export function createToolbarDOM(config, pluginManager) {
    const shell = document.createElement('div')
    shell.className = 'je-toolbar-shell'

    config.toolbar.forEach((rowItems, rowIndex) => {
        const row = document.createElement('div')
        row.className = ROW_CLASSES[rowIndex] || ROW_CLASSES[0]
        row.dataset.rowIndex = String(rowIndex)

        rowItems.forEach((item) => {
            if (item === '|') {
                row.appendChild(createSeparator())
                return
            }

            if (item === '->') {
                row.appendChild(createSpacer())
                return
            }

            const plugin = pluginManager.get(item)
            if (plugin) {
                row.appendChild(createButton(plugin))
            }
        })

        shell.appendChild(row)
    })

    return shell
}

export function initToolbarEvents(containerEl, editor, pluginManager, options = {}) {
    const disposers = []
    const plugins = pluginManager.getAll()
    let activePopover = null
    let nestedPopover = null
    let sync
    const moreController = options.moreController || null

    function closeNestedPopover() {
        if (!nestedPopover) return
        nestedPopover.remove()
        nestedPopover = null
    }

    function closePopover() {
        closeNestedPopover()
        if (!activePopover) return
        activePopover.remove()
        activePopover = null
    }

    function openNestedPopover(popoverEl, anchorEl) {
        closeNestedPopover()
        nestedPopover = popoverEl
        document.body.appendChild(popoverEl)
        positionPopover(popoverEl, anchorEl, 'right')
    }

    function openPopover(pluginName, anchorEl) {
        if (pluginName === 'more') {
            sync()
        }

        const plugin = pluginManager.get(pluginName)
        if (!plugin?.renderPopover) return

        if (activePopover?.dataset.pluginName === pluginName) {
            closePopover()
            return
        }

        closePopover()

        const popover = plugin.renderPopover(editor, {
            closePopover,
            closeNestedPopover,
            openNestedPopover,
        })

        if (!popover) return

        popover.dataset.pluginName = pluginName
        document.body.appendChild(popover)
        positionPopover(popover, anchorEl)
        activePopover = popover
    }

    const secondaryRow = containerEl.querySelector('.je-toolbar-row--secondary')
    const moreButton = secondaryRow?.querySelector('[data-plugin-name="more"]')
    const overflowOrder = [
        'codeBlock',
        'inlineCode',
        'lineHeight',
        'align',
        'orderedList',
        'bulletList',
        'callout',
        'textColor',
        'strike',
        'underline',
        'italic',
        'bold',
        'fontSize',
        'fontFamily',
        'heading',
        'clearFormat',
        'formatPainter',
    ]

    function normalizeSecondaryOverflow() {
        if (!secondaryRow || !moreButton || !moreController) return
        if (!secondaryRow.clientWidth || !moreButton.getBoundingClientRect().width) return

        Array.from(secondaryRow.children).forEach((child) => {
            child.classList.remove('is-overflow-hidden')
        })

        overflowOrder.forEach((name) => {
            const element = secondaryRow.querySelector(`[data-plugin-name="${name}"], [data-command-group="${name}"]`)
            if (element) element.classList.remove('is-overflow-hidden')
        })

        const staticCount = moreController.staticItems?.length || 0
        moreController.hiddenItems = []
        moreButton.style.display = staticCount > 0 ? '' : 'none'

        const measureUsedWidth = () => Array.from(secondaryRow.children).reduce((total, child) => {
            if (child.dataset.role === 'spacer') return total
            return total + getOuterWidth(child)
        }, 0)

        const availableWidth = secondaryRow.clientWidth
        const hiddenItems = []

        for (const name of overflowOrder) {
            if (measureUsedWidth() <= availableWidth) break
            const element = secondaryRow.querySelector(`[data-plugin-name="${name}"], [data-command-group="${name}"]`)
            if (!element || element.classList.contains('is-overflow-hidden')) continue
            element.classList.add('is-overflow-hidden')
            hiddenItems.push(name)
            moreController.hiddenItems = [...hiddenItems]
            moreButton.style.display = moreController.getItems().length > 0 ? '' : 'none'
        }

        moreController.hiddenItems = hiddenItems
        const hasMoreItems = staticCount + hiddenItems.length > 0
        moreButton.style.display = hasMoreItems ? '' : 'none'
    }

    containerEl.querySelectorAll('[data-command]').forEach((btn) => {
        const plugin = pluginManager.get(btn.dataset.command)

        const onClick = () => {
            closePopover()
            if (plugin) plugin.command(editor)
            sync()
        }

        const onDoubleClick = () => {
            if (typeof plugin?.onDoubleClick === 'function') {
                plugin.onDoubleClick(editor)
                sync()
            }
        }

        btn.addEventListener('click', onClick)
        btn.addEventListener('dblclick', onDoubleClick)

        disposers.push(() => btn.removeEventListener('click', onClick))
        disposers.push(() => btn.removeEventListener('dblclick', onDoubleClick))
    })

    containerEl.querySelectorAll('[data-command-toggle]').forEach((btn) => {
        const onClick = (event) => {
            event.stopPropagation()
            openPopover(btn.dataset.commandToggle, btn)
        }

        btn.addEventListener('click', onClick)
        disposers.push(() => btn.removeEventListener('click', onClick))
    })

    const onDocumentClick = (event) => {
        if (activePopover?.contains(event.target)) return
        if (nestedPopover?.contains(event.target)) return
        closePopover()
    }

    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('click', onDocumentClick)
    disposers.push(() => document.removeEventListener('mousedown', onDocumentClick))
    disposers.push(() => document.removeEventListener('click', onDocumentClick))

    const onWindowResize = () => closePopover()
    const onWindowScroll = (event) => {
        if (
            (activePopover && activePopover.contains(event.target))
            || (nestedPopover && nestedPopover.contains(event.target))
        ) {
            return
        }
        closePopover()
    }
    window.addEventListener('resize', onWindowResize)
    window.addEventListener('resize', normalizeSecondaryOverflow)
    window.addEventListener('scroll', onWindowScroll, true)
    disposers.push(() => window.removeEventListener('resize', onWindowResize))
    disposers.push(() => window.removeEventListener('resize', normalizeSecondaryOverflow))
    disposers.push(() => window.removeEventListener('scroll', onWindowScroll, true))

    sync = function sync() {
        plugins.forEach((plugin) => {
            const commandButton = containerEl.querySelector(`[data-command="${plugin.name}"]`)
            const toggleButton = containerEl.querySelector(`[data-command-toggle="${plugin.name}"]`)
            const group = containerEl.querySelector(`[data-command-group="${plugin.name}"]`)
            const target = group || commandButton || toggleButton

            if (target && typeof plugin.isActive === 'function') {
                target.classList.toggle('is-active', plugin.isActive(editor))
            }

            if (target && typeof plugin.isDisabled === 'function') {
                const disabled = plugin.isDisabled(editor)
                target.classList.toggle('is-disabled', disabled)
                if (commandButton) commandButton.disabled = disabled
                if (toggleButton) toggleButton.disabled = disabled
            }

            if (typeof plugin.getToolbarState === 'function') {
                const state = plugin.getToolbarState(editor)

                if (plugin.toolbar.dropdown) {
                    updateDropdownButton(containerEl, plugin.name, state, plugin.toolbar.text)
                }

                if (plugin.toolbar.type === 'color') {
                    updateColorButton(containerEl, plugin.name, state, plugin.toolbar.colorBar)
                }

                updateRegularButton(containerEl, plugin, state)
            }
        })
        requestAnimationFrame(normalizeSecondaryOverflow)
    }

    editor.on('selectionUpdate', sync)
    editor.on('update', sync)
    disposers.push(() => editor.off('selectionUpdate', sync))
    disposers.push(() => editor.off('update', sync))

    sync()

    const cleanup = () => {
        closePopover()
        disposers.forEach((dispose) => dispose())
    }
    cleanup.sync = sync

    return cleanup
}
