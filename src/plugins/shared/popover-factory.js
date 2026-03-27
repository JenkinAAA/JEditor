function createButton(className, label, onClick) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = className
    button.textContent = label
    button.addEventListener('click', onClick)
    return button
}

export function createListPopover(items, onSelect, options = {}) {
    const popover = document.createElement('div')
    popover.className = 'je-popover je-popover-list'
    if (options.className) {
        popover.className += ` ${options.className}`
    }

    popover.addEventListener('wheel', (event) => {
        const scrollable = event.currentTarget
        if (!(scrollable instanceof HTMLElement)) return

        if (scrollable.scrollHeight <= scrollable.clientHeight) return

        scrollable.scrollTop += event.deltaY
        event.preventDefault()
        event.stopPropagation()
    }, { passive: false })

    items.forEach((item) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'je-popover-item'
        if (item.icon) {
            button.innerHTML = `${item.icon}<span>${item.label}</span>`
        } else {
            button.textContent = item.label
        }
        if (item.style) {
            Object.assign(button.style, item.style)
        }
        button.addEventListener('click', () => onSelect(item))
        popover.appendChild(button)
    })

    return popover
}

function createStylePreview({ text, textColor, empty = false, clear = false }) {
    const preview = document.createElement('span')
    preview.className = 'je-style-preview'

    if (clear) {
        preview.classList.add('is-clear')
        preview.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7 21 3-3"/>
                <path d="M16 3 4 15a2.83 2.83 0 0 0 4 4L20 7a2.83 2.83 0 0 0-4-4Z"/>
                <path d="M14 7 17 10"/>
                <path d="M8 21h12"/>
            </svg>
        `
        return preview
    }

    if (empty) {
        preview.classList.add('is-empty')
        return preview
    }

    preview.style.color = textColor || 'currentColor'
    preview.textContent = text
    return preview
}

function appendColorSectionTitle(parent, text) {
    const title = document.createElement('div')
    title.className = 'je-color-section-title'
    title.textContent = text
    parent.appendChild(title)
}

function appendRecentSection(popover, config, ctx) {
    const section = document.createElement('div')
    section.className = 'je-color-section'
    appendColorSectionTitle(section, '最近使用')

    const grid = document.createElement('div')
    grid.className = 'je-color-grid je-color-grid--recent'

    const recent = [...config.getRecentStyles(ctx.editor)]
    while (recent.length < 5) recent.push(null)

    recent.forEach((style) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'je-color-swatch je-color-swatch--combo'

        if (style) {
            button.style.background = style.backgroundColor || '#fff'
            button.appendChild(createStylePreview({
                text: config.previewText,
                textColor: style.textColor,
            }))
            button.addEventListener('click', () => config.applyStyle(ctx.editor, style, ctx))
        } else {
            button.disabled = true
            button.classList.add('is-empty')
            button.appendChild(createStylePreview({ text: config.previewText, empty: true }))
        }

        grid.appendChild(button)
    })

    const clearButton = document.createElement('button')
    clearButton.type = 'button'
    clearButton.className = 'je-color-swatch je-color-swatch--combo je-color-swatch--clear'
    clearButton.appendChild(createStylePreview({ text: config.previewText, clear: true }))
    clearButton.addEventListener('click', () => config.clearStyle(ctx.editor, ctx))
    grid.appendChild(clearButton)

    section.appendChild(grid)
    popover.appendChild(section)
}

function appendPaletteSection(popover, titleText, colors, mode, config, ctx) {
    const section = document.createElement('div')
    section.className = 'je-color-section'
    appendColorSectionTitle(section, titleText)

    const grid = document.createElement('div')
    grid.className = 'je-color-grid'

    colors.forEach((color) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = `je-color-swatch ${mode === 'text' ? 'je-color-swatch--text' : 'je-color-swatch--filled'}`

        if (mode === 'text') {
            button.appendChild(createStylePreview({
                text: config.previewText,
                textColor: color,
            }))
            button.style.borderColor = color
        } else {
            button.style.background = color
        }

        button.addEventListener('click', () => config.applyColor(ctx.editor, mode, color, ctx))
        grid.appendChild(button)
    })

    const customButton = document.createElement('button')
    customButton.type = 'button'
    customButton.className = 'je-color-swatch je-color-swatch--custom'
    customButton.textContent = '+'
    customButton.addEventListener('click', () => {
        config.showCustomPanel(section, mode, ctx)
    })
    grid.appendChild(customButton)

    section.appendChild(grid)
    popover.appendChild(section)
}

function appendCustomPanel(popover, config, ctx) {
    const panel = document.createElement('div')
    panel.className = 'je-color-custom-panel is-hidden'

    const title = document.createElement('div')
    title.className = 'je-color-custom-title'

    const picker = document.createElement('input')
    picker.type = 'color'
    picker.className = 'je-color-picker'

    const actions = document.createElement('div')
    actions.className = 'je-color-actions'

    const confirmButton = createButton('je-action-btn is-primary', '确认', () => {
        config.applyColor(ctx.editor, panel.dataset.mode, picker.value, ctx)
    })

    const cancelButton = createButton('je-action-btn', '取消', () => {
        panel.classList.add('is-hidden')
    })

    actions.append(confirmButton, cancelButton)
    panel.append(title, picker, actions)
    popover.appendChild(panel)

    return panel
}

export function createColorPopover(config, ctx) {
    const popover = document.createElement('div')
    popover.className = 'je-popover je-popover-color'

    appendRecentSection(popover, config, ctx)
    appendPaletteSection(popover, '字体颜色', config.textColors, 'text', config, ctx)
    appendPaletteSection(popover, '背景颜色', config.backgroundColors, 'background', config, ctx)

    const customPanel = appendCustomPanel(popover, config, ctx)
    config.showCustomPanel = (section, mode, localCtx) => {
        customPanel.dataset.mode = mode
        customPanel.classList.remove('is-hidden')
        customPanel.querySelector('.je-color-custom-title').textContent = mode === 'text'
            ? '自定义字体颜色'
            : '自定义背景颜色'
        customPanel.querySelector('.je-color-picker').value = config.getCurrentColor(localCtx.editor, mode)
        section.appendChild(customPanel)
    }

    return popover
}
