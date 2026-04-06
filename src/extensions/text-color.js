import { Mark } from '@tiptap/core'

export const TextColor = Mark.create({
  name: 'textColor',
  priority: 1000,
  excludes: '',

  addAttributes() {
    return {
      color: {
        default: null,
        // 核心修复：阻止 Tiptap 自动将属性名渲染到 HTML 标签上
        renderHTML: false,
        parseHTML: (element) => element.style.color || null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => (element.style.color ? { color: element.style.color } : false),
      },
      {
        tag: 'font[color]',
        getAttrs: (element) => ({ color: element.getAttribute('color') }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // 如果没有颜色，渲染纯 span
    if (!HTMLAttributes.color) {
      return ['span', {}, 0]
    }

    // 手动构建需要的属性，只保留 style
    return ['span', { style: `color: ${HTMLAttributes.color}` }, 0]
  },

  addCommands() {
    return {
      setTextColor:
        (color) =>
        ({ commands }) => {
          return commands.setMark(this.name, { color })
        },
      unsetTextColor:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})
