// src/plugins/image/extension.js
// Tiptap Node 扩展 + NodeView（选中描边 + 四角拖拽缩放）
// 从原 src/editor/extensions/image.js 迁移，逻辑不变
import { Node, mergeAttributes } from '@tiptap/core'

class ImageNodeView {
    constructor({ node, editor, getPos }) {
        this.node = node
        this.editor = editor
        this.getPos = getPos
        this._startX = 0
        this._startWidth = 0
        this._pendingWidth = null
        this._activeCorner = null

        this.dom = document.createElement('span')
        this.dom.className = 'image-node-wrapper'
        this.dom.contentEditable = 'false'

        this.img = document.createElement('img')
        this.img.src = node.attrs.src
        this.img.alt = node.attrs.alt || ''
        this.img.draggable = false
        if (node.attrs.width) {
            this.img.style.width = node.attrs.width + 'px'
        }

        this.dom.appendChild(this.img)

        for (const corner of ['tl', 'tr', 'bl', 'br']) {
            const h = document.createElement('span')
            h.className = 'image-resize-handle'
            h.dataset.corner = corner
            h.addEventListener('mousedown', (e) => this._onHandleMouseDown(e, corner))
            this.dom.appendChild(h)
        }

        this.dom.addEventListener('click', (e) => {
            e.stopPropagation()
            const pos = this.getPos()
            if (typeof pos === 'number') {
                this.editor.commands.setNodeSelection(pos)
            }
        })

        this._boundMouseMove = this._handleMouseMove.bind(this)
        this._boundMouseUp = this._handleMouseUp.bind(this)
    }

    selectNode() { this.dom.classList.add('is-selected') }
    deselectNode() { this.dom.classList.remove('is-selected') }

    _onHandleMouseDown(e, corner) {
        e.preventDefault()
        e.stopPropagation()
        this._activeCorner = corner
        this._startX = e.clientX
        this._startWidth = this.img.getBoundingClientRect().width
        document.addEventListener('mousemove', this._boundMouseMove)
        document.addEventListener('mouseup', this._boundMouseUp)
        document.body.style.userSelect = 'none'
    }

    _handleMouseMove(e) {
        const dx = e.clientX - this._startX
        const isEast = this._activeCorner.includes('r')
        let newWidth = isEast ? this._startWidth + dx : this._startWidth - dx
        newWidth = Math.max(50, Math.round(newWidth))
        this.img.style.width = newWidth + 'px'
        this._pendingWidth = newWidth
    }

    _handleMouseUp() {
        document.removeEventListener('mousemove', this._boundMouseMove)
        document.removeEventListener('mouseup', this._boundMouseUp)
        document.body.style.userSelect = ''
        if (this._pendingWidth !== null) {
            const pos = this.getPos()
            if (typeof pos === 'number') {
                this.editor.view.dispatch(
                    this.editor.state.tr.setNodeMarkup(pos, null, {
                        ...this.node.attrs,
                        width: this._pendingWidth,
                    })
                )
            }
            this._pendingWidth = null
        }
    }

    update(node) {
        if (node.type !== this.node.type) return false
        this.node = node
        this.img.src = node.attrs.src
        this.img.alt = node.attrs.alt || ''
        if (node.attrs.width) {
            this.img.style.width = node.attrs.width + 'px'
        } else {
            this.img.style.width = ''
        }
        return true
    }

    destroy() {
        document.removeEventListener('mousemove', this._boundMouseMove)
        document.removeEventListener('mouseup', this._boundMouseUp)
        document.body.style.userSelect = ''
    }
}

export const CustomImage = Node.create({
    name: 'image',
    group: 'inline',
    inline: true,
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            src:   { default: null },
            alt:   { default: null },
            width: { default: null },
        }
    },

    parseHTML() {
        return [{ tag: 'img[src]' }]
    },

    renderHTML({ HTMLAttributes }) {
        const attrs = { ...HTMLAttributes }
        if (attrs.width) attrs.style = `width:${attrs.width}px`
        delete attrs.width
        return ['img', mergeAttributes(attrs)]
    },

    addNodeView() {
        return (props) => new ImageNodeView(props)
    },

    addCommands() {
        return {
            setImage: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                })
            },
        }
    },
})
