// src/editor/index.js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

/**
 * 创建 Tiptap 编辑器实例
 * @param {HTMLElement} element - 挂载容器
 * @param {Array} pluginExtensions - 各 plugin 提供的 Tiptap Extension
 * @param {Object} options - 其他选项
 * @returns {Editor}
 */
export function createEditor(element, pluginExtensions = [], options = {}) {
    const editor = new Editor({
        element,
        extensions: [
            StarterKit.configure({ history: true }),
            ...pluginExtensions,
        ],
        editorProps: {
            attributes: {
                class: 'tiptap-editor',
                spellcheck: 'false',
            },
        },
        content: options.content || `<p>${options.placeholder || '开始在此编写文档...'}</p>`,
    })

    return editor
}
