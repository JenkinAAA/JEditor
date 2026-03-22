// src/core/plugin-manager.js

/**
 * Plugin 统一接口定义（JSDoc）
 *
 * @typedef {Object} JPlugin
 * @property {string}            name            - 唯一标识，与 data-command 一致
 * @property {Object}            toolbar         - 工具栏按钮描述
 * @property {string|null}       toolbar.icon    - SVG 字符串 / feather 图标名 / null
 * @property {string|null}       toolbar.text    - 按钮文字（icon 为空时使用）
 * @property {string}            toolbar.title   - tooltip 提示
 * @property {string|null}       toolbar.shortcut- 快捷键文字
 * @property {string|null}       toolbar.className- 额外 CSS class
 * @property {Object|null}       tiptapExtension - Tiptap Extension（已在 StarterKit 中的传 null）
 * @property {Function}          command         - (editor, pluginConfig) => void
 * @property {Function}          [isActive]      - (editor) => boolean
 * @property {Function}          [isDisabled]    - (editor) => boolean
 * @property {Function}          [init]          - (editor, pluginConfig) => void（编辑器就绪后调用）
 * @property {Function}          [destroy]       - () => void
 */

export class PluginManager {
    constructor() {
        /** @type {Map<string, JPlugin>} */
        this._plugins = new Map()
    }

    /**
     * 注册一个 plugin
     */
    register(plugin) {
        if (!plugin.name) throw new Error('[JEditor] Plugin 缺少 name 字段')
        this._plugins.set(plugin.name, plugin)
    }

    /**
     * 批量注册
     */
    registerAll(plugins) {
        plugins.forEach((p) => this.register(p))
    }

    /**
     * 按 name 取 plugin
     */
    get(name) {
        return this._plugins.get(name)
    }

    /**
     * 返回所有已注册的 plugin
     */
    getAll() {
        return Array.from(this._plugins.values())
    }

    /**
     * 收集所有 plugin 提供的 Tiptap Extension（用于创建 Editor）
     */
    getTiptapExtensions() {
        return this.getAll()
            .filter((p) => p.tiptapExtension != null)
            .map((p) => p.tiptapExtension)
    }

    /**
     * 编辑器就绪后，逐个调用 plugin.init()
     */
    initAll(editor, config = {}) {
        this.getAll().forEach((p) => {
            if (typeof p.init === 'function') {
                p.init(editor, config[p.name] || {})
            }
        })
    }

    /**
     * 销毁所有 plugin
     */
    destroyAll() {
        this.getAll().forEach((p) => {
            if (typeof p.destroy === 'function') p.destroy()
        })
        this._plugins.clear()
    }
}
