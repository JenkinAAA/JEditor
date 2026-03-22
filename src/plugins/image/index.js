// src/plugins/image/index.js
import { CustomImage } from './extension.js'

/**
 * 图片插件
 * - 点击工具栏按钮上传本地图片
 * - Ctrl+V 粘贴剪贴板图片
 * - 支持 PNG / JPG / GIF 等格式
 * - 可配置 maxSize / uploadUrl
 */

let _fileInput = null          // 隐藏的 file input
let _editor = null
let _config = {}

function insertImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const maxSize = _config.maxSize || 20 * 1024 * 1024
    if (file.size > maxSize) {
        alert(`图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)
        return
    }
    // TODO: 如果 _config.uploadUrl 存在，走服务端上传
    // 目前使用 base64 data URL
    const reader = new FileReader()
    reader.onload = (e) => {
        _editor.chain().focus().setImage({ src: e.target.result }).run()
    }
    reader.readAsDataURL(file)
}

function onPaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            e.preventDefault()
            insertImageFile(item.getAsFile())
            return
        }
    }
}

export default {
    name: 'insertImage',

    toolbar: {
        icon: 'image',       // feather icon name
        title: '插入图片',
    },

    tiptapExtension: CustomImage,

    command: () => {
        if (_fileInput) _fileInput.click()
    },

    isActive: () => false,

    /**
     * 编辑器就绪后：创建隐藏 file input + 监听粘贴事件
     */
    init(editor, pluginConfig) {
        _editor = editor
        _config = pluginConfig

        // 创建隐藏 input
        _fileInput = document.createElement('input')
        _fileInput.type = 'file'
        _fileInput.accept = pluginConfig.accept || 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml'
        _fileInput.style.display = 'none'
        document.body.appendChild(_fileInput)

        _fileInput.addEventListener('change', () => {
            const file = _fileInput.files[0]
            if (file) insertImageFile(file)
            _fileInput.value = ''
        })

        // 监听 Ctrl+V 粘贴图片
        editor.view.dom.addEventListener('paste', onPaste)
    },

    destroy() {
        if (_fileInput) {
            _fileInput.remove()
            _fileInput = null
        }
        if (_editor) {
            _editor.view.dom.removeEventListener('paste', onPaste)
            _editor = null
        }
    },
}
