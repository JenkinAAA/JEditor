import { CustomImage } from './extension.js'
import { ICONS } from '../shared/icon-set.js'

let fileInput = null
let editorRef = null
let configRef = {}

function insertImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return

  const maxSize = configRef.maxSize || 20 * 1024 * 1024
  if (file.size > maxSize) {
    alert(`图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    editorRef.chain().focus().setImage({ src: event.target.result }).run()
  }
  reader.readAsDataURL(file)
}

function onPaste(event) {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      insertImageFile(item.getAsFile())
      return
    }
  }
}

export default {
  name: 'insertImage',
  configKey: 'image',
  toolbar: {
    icon: ICONS.imageUp,
    title: '插入图片',
  },
  tiptapExtension: CustomImage,
  command: () => {
    fileInput?.click()
  },
  isActive: () => false,
  init(editor, pluginConfig) {
    editorRef = editor
    configRef = pluginConfig || {}

    fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept =
      pluginConfig.accept || 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml'
    fileInput.style.display = 'none'
    document.body.appendChild(fileInput)

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0]
      if (file) insertImageFile(file)
      fileInput.value = ''
    })

    editor.view.dom.addEventListener('paste', onPaste)
  },
  destroy() {
    fileInput?.remove()
    fileInput = null
    if (editorRef) {
      editorRef.view.dom.removeEventListener('paste', onPaste)
      editorRef = null
    }
  },
}
