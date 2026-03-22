// src/toolbar/ui.js
// 阶段 2：工具栏完全由 config + PluginManager 驱动，零 HTML 硬编码

// ---- 常量 SVG ----
const CHEVRON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'

// ---- 行样式 ----
const ROW_CLASSES = [
    'je-toolbar-row je-toolbar-row--primary',    // 第一行（白色）
    'je-toolbar-row je-toolbar-row--secondary',   // 第二行（灰色圆角）
]

// ---- 获取图标 HTML ----
function iconHTML(iconDef) {
    if (!iconDef) return null
    // raw SVG
    if (iconDef.startsWith('<')) return iconDef
    // feather icon
    if (window.feather?.icons[iconDef]) {
        return feather.icons[iconDef].toSvg({ width: 20, height: 20 })
    }
    return null
}

// ---- 创建按钮 ----
function createButton(plugin) {
    const t = plugin.toolbar
    const isDropdown = t.dropdown === true
    const isColor = t.type === 'color'

    // 颜色复合按钮：主按钮 + 箭头 包在一个 wrapper 里
    if (isColor) {
        const wrapper = document.createElement('div')
        wrapper.className = 'je-color-group'

        const main = document.createElement('button')
        main.className = 'tool-btn'
        main.dataset.command = plugin.name
        main.title = t.title || ''
        main.innerHTML = `<span class="je-color-inner"><span class="je-color-char">${t.text || 'A'}</span><span class="je-color-bar" style="background:${t.colorBar || '#000'}"></span></span>`

        const arrow = document.createElement('button')
        arrow.className = 'tool-btn-arrow-down'
        arrow.innerHTML = CHEVRON_SVG

        wrapper.append(main, arrow)
        return wrapper
    }

    // 下拉文字按钮
    if (isDropdown) {
        const btn = document.createElement('button')
        btn.className = 'tool-btn-text'
        btn.dataset.command = plugin.name
        btn.title = t.title || ''
        btn.innerHTML = `${t.text || ''} ${CHEVRON_SVG}`
        return btn
    }

    // 普通按钮（图标 / 文字）
    const btn = document.createElement('button')
    btn.className = 'tool-btn'
    if (t.className) btn.className += ' ' + t.className
    btn.dataset.command = plugin.name
    btn.title = t.shortcut ? `${t.title} (${t.shortcut})` : (t.title || '')

    const svg = iconHTML(t.icon)
    if (svg) {
        btn.innerHTML = svg
    } else {
        btn.textContent = t.text || ''
    }

    return btn
}

function createSeparator() {
    const el = document.createElement('div')
    el.className = 'v-divider'
    return el
}

function createSpacer() {
    const el = document.createElement('div')
    el.className = 'je-spacer'
    return el
}

// ============================================================
// 公开 API
// ============================================================

/**
 * 从 config.toolbar 数组 + pluginManager 生成完整工具栏 DOM
 * @returns {DocumentFragment}
 */
export function createToolbarDOM(config, pluginManager) {
    const frag = document.createDocumentFragment()

    config.toolbar.forEach((rowItems, rowIndex) => {
        const row = document.createElement('div')
        row.className = ROW_CLASSES[rowIndex] || ROW_CLASSES[0]

        rowItems.forEach((item) => {
            if (item === '|') {
                row.appendChild(createSeparator())
            } else if (item === '->') {
                row.appendChild(createSpacer())
            } else {
                const plugin = pluginManager.get(item)
                if (plugin) {
                    row.appendChild(createButton(plugin))
                }
            }
        })

        frag.appendChild(row)
    })

    return frag
}

/**
 * 绑定工具栏事件（点击命令 + 状态同步）
 * @param {HTMLElement} containerEl - 限定作用域的容器
 */
export function initToolbarEvents(containerEl, editor, pluginManager) {
    // 点击 → plugin.command()
    containerEl.querySelectorAll('[data-command]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const plugin = pluginManager.get(btn.dataset.command)
            if (plugin) plugin.command(editor)
        })
    })

    // 激活 / 禁用状态同步
    const plugins = pluginManager.getAll()

    function sync() {
        plugins.forEach((p) => {
            const el = containerEl.querySelector(`[data-command="${p.name}"]`)
            if (!el) return
            if (typeof p.isActive === 'function') {
                el.classList.toggle('is-active', p.isActive(editor))
            }
            if (typeof p.isDisabled === 'function') {
                el.classList.toggle('is-disabled', p.isDisabled(editor))
            }
        })
    }

    editor.on('selectionUpdate', sync)
    editor.on('update', sync)
    sync()
}
