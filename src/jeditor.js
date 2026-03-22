// src/jeditor.js — JEditor 主类，唯一对外入口
import { PluginManager } from './core/plugin-manager.js'
import { mergeConfig } from './core/config.js'
import { builtinPlugins } from './plugins/index.js'
import { createEditor } from './editor/index.js'
import { createToolbarDOM, initToolbarEvents } from './toolbar/ui.js'

export class JEditor {

    /**
     * 一行创建编辑器
     *
     * @param {string|HTMLElement} selector - CSS 选择器或 DOM 元素
     * @param {Object} userConfig - 用户配置（可选）
     * @returns {JEditor}
     *
     * @example
     * const editor = JEditor.create('#container', {
     *     placeholder: '开始你的创作...',
     *     toolbar: [
     *         ['undo', 'redo', '|', 'bold', 'italic', 'underline'],
     *     ],
     *     image: { uploadUrl: '/api/upload' },
     * })
     */
    static create(selector, userConfig = {}) {
        const el = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector
        if (!el) {
            throw new Error(`[JEditor] 找不到容器元素: ${selector}`)
        }
        return new JEditor(el, userConfig)
    }

    // ---- 构造 ----
    constructor(container, userConfig = {}) {
        /** @type {HTMLElement} */
        this._container = container
        /** @type {Object} */
        this._config = mergeConfig(userConfig)
        /** @type {PluginManager} */
        this._pm = new PluginManager()
        /** @type {import('@tiptap/core').Editor|null} */
        this._editor = null

        this._bootstrap()
    }

    // ---- 初始化流程 ----
    _bootstrap() {
        const { _container: el, _config: config, _pm: pm } = this

        // 容器标记
        el.classList.add('je-container')

        // 1. 注册 plugin
        pm.registerAll(builtinPlugins)

        // 2. 生成工具栏 → 插入容器
        el.appendChild(createToolbarDOM(config, pm))

        // 3. 编辑区 wrapper
        const wrapper = document.createElement('div')
        wrapper.className = 'je-editor-area'
        el.appendChild(wrapper)

        // 4. 创建 Tiptap 编辑器
        this._editor = createEditor(wrapper, pm.getTiptapExtensions(), config)

        // 5. 通知各 plugin（image 在此创建 file input + 粘贴监听）
        pm.initAll(this._editor, config)

        // 6. 绑定工具栏事件（作用域限定在当前容器内）
        initToolbarEvents(el, this._editor, pm)
    }

    // ============================================================
    //  公开 API
    // ============================================================

    /** 获取 HTML 内容 */
    getHTML() {
        return this._editor.getHTML()
    }

    /** 获取 JSON 内容 */
    getJSON() {
        return this._editor.getJSON()
    }

    /** 获取纯文本 */
    getText() {
        return this._editor.getText()
    }

    /** 设置内容（HTML 字符串或 JSON） */
    setContent(content, emitUpdate = false) {
        this._editor.commands.setContent(content, emitUpdate)
    }

    /** 编辑器是否为空 */
    isEmpty() {
        return this._editor.isEmpty
    }

    /** 聚焦编辑器 */
    focus() {
        this._editor.commands.focus()
    }

    /** 监听事件 (update / selectionUpdate / ...) */
    on(event, handler) {
        this._editor.on(event, handler)
        return this
    }

    /** 移除事件监听 */
    off(event, handler) {
        this._editor.off(event, handler)
        return this
    }

    /** 获取底层 Tiptap Editor 实例（高级用法） */
    get tiptap() {
        return this._editor
    }

    /** 销毁编辑器，清理一切 */
    destroy() {
        this._pm.destroyAll()
        this._editor.destroy()
        this._container.innerHTML = ''
        this._container.classList.remove('je-container')
        this._editor = null
    }
}
