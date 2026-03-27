import { Node, mergeAttributes } from '@tiptap/core'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import { CALLOUT_TYPES } from '../plugins/shared/style-presets.js'

const HANDLE_HIDE_DELAY = 1500
const CALLOUT_MAP = new Map(CALLOUT_TYPES.map((item) => [item.value, item]))

function getCalloutType(value) {
    return CALLOUT_MAP.get(value) || CALLOUT_TYPES[0]
}

function buildTypeAttrs(value) {
    const type = getCalloutType(value)
    return {
        type: type.value,
        title: type.label,
        textColor: type.textColor,
        backgroundColor: type.backgroundColor,
    }
}

function findCalloutContext($pos) {
    for (let depth = $pos.depth; depth > 0; depth -= 1) {
        if ($pos.node(depth).type.name === 'callout') {
            return {
                depth,
                node: $pos.node(depth),
                pos: $pos.before(depth),
            }
        }
    }
    return null
}

function iconMarkup(type) {
    const stroke = type.textColor
    const icons = {
        note: `<svg viewBox="0 0 24 24" fill="none"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21L16.65 16.65" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 9.5C12.3807 9.5 13.5 8.38071 13.5 7C13.5 5.61929 12.3807 4.5 11 4.5C9.61929 4.5 8.5 5.61929 8.5 7C8.5 8.38071 9.61929 9.5 11 9.5Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        tip: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 22C11.1716 22 10.5 21.3284 10.5 20.5C10.5 19.6716 11.1716 19 12 19C12.8284 19 13.5 19.6716 13.5 20.5C13.5 21.3284 12.8284 22 12 22Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 11C9 8.79086 10.7909 7 13 7C15.2091 7 17 8.79086 17 11C17 13.2091 15.2091 15 13 15C10.7909 15 9 13.2091 9 11Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 7C8 3.68629 10.6863 1 14 1C17.3137 1 20 3.68629 20 7C20 10.3137 17.3137 13 14 13C10.6863 13 8 10.3137 8 7Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        important: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 8V12L15 15" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V12" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16H12.01" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        success: `<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.9115 2 13.7888 2.10299 14.623 2.29289" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        help: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16V16.01" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11H12Z" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    }
    return icons[type.value] || icons.note
}

export const Callout = Node.create({
    name: 'callout',
    group: 'block',
    content: 'block+',
    draggable: true,
    isolating: true,
    defining: true,

    addAttributes() {
        return {
            type: {
                default: 'note',
                parseHTML: (element) => element.getAttribute('data-callout-type') || 'note',
                renderHTML: (attributes) => ({ 'data-callout-type': attributes.type }),
            },
            title: {
                default: CALLOUT_TYPES[0].label,
                parseHTML: (element) => element.getAttribute('data-callout-title') || CALLOUT_TYPES[0].label,
                renderHTML: (attributes) => ({ 'data-callout-title': attributes.title }),
            },
            textColor: {
                default: CALLOUT_TYPES[0].textColor,
                parseHTML: (element) => element.getAttribute('data-callout-color') || CALLOUT_TYPES[0].textColor,
                renderHTML: (attributes) => ({ 'data-callout-color': attributes.textColor }),
            },
            backgroundColor: {
                default: CALLOUT_TYPES[0].backgroundColor,
                parseHTML: (element) => element.getAttribute('data-callout-bg') || CALLOUT_TYPES[0].backgroundColor,
                renderHTML: (attributes) => ({ 'data-callout-bg': attributes.backgroundColor }),
            },
        }
    },

    parseHTML() {
        return [{ tag: 'div[data-callout]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-callout': '',
                class: 'je-callout',
                style: `--je-callout-color:${HTMLAttributes.textColor};--je-callout-bg:${HTMLAttributes.backgroundColor};`,
            }),
            ['div', { class: 'je-callout-header', contenteditable: 'false' },
                ['span', { class: 'je-callout-icon' }],
                ['span', { class: 'je-callout-title' }, HTMLAttributes.title],
            ],
            ['div', { class: 'je-callout-body' }, 0],
        ]
    },

    addCommands() {
        return {
            insertCallout: (attrs = {}) => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: {
                    ...buildTypeAttrs(attrs.type || 'note'),
                    ...attrs,
                },
                content: [{ type: 'paragraph' }],
            }),
            setCalloutType: (type) => ({ state, dispatch }) => {
                const context = findCalloutContext(state.selection.$from)
                if (!context) return false

                const nextAttrs = {
                    ...context.node.attrs,
                    ...buildTypeAttrs(type),
                }

                if (dispatch) {
                    dispatch(state.tr.setNodeMarkup(context.pos, undefined, nextAttrs))
                }

                return true
            },
        }
    },

    addKeyboardShortcuts() {
        return {
            'Shift-Enter': () => {
                const context = findCalloutContext(this.editor.state.selection.$from)
                if (!context) return false
                return this.editor.commands.enter()
            },
            Enter: () => {
                const { state, view } = this.editor
                const context = findCalloutContext(state.selection.$from)
                if (!context) return false

                const { $from } = state.selection
                if (
                    $from.parent.type.name !== 'paragraph'
                    || $from.parent.content.size > 0
                    || $from.depth !== context.depth + 1
                ) {
                    return false
                }

                const paragraph = state.schema.nodes.paragraph.create()
                const paragraphPos = $from.before($from.depth)
                const paragraphSize = $from.parent.nodeSize
                const insertPos = $from.after(context.depth) - paragraphSize
                const tr = state.tr.delete(paragraphPos, paragraphPos + paragraphSize).insert(insertPos, paragraph)
                tr.setSelection(TextSelection.create(tr.doc, insertPos + 1))
                view.dispatch(tr.scrollIntoView())
                return true
            },
        }
    },

    addNodeView() {
        return ({ node, editor, getPos }) => {
            let popover = null
            let hideHandleTimer = null

            const wrapper = document.createElement('div')
            wrapper.className = 'je-callout-wrapper'

            const dom = document.createElement('div')
            dom.className = 'je-callout'
            dom.dataset.callout = ''

            const header = document.createElement('div')
            header.className = 'je-callout-header'
            header.contentEditable = 'false'

            const dragHandle = document.createElement('button')
            dragHandle.type = 'button'
            dragHandle.className = 'je-callout-drag-handle'
            dragHandle.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="8" cy="7" r="1.5" fill="currentColor"/>
                    <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="8" cy="17" r="1.5" fill="currentColor"/>
                    <circle cx="16" cy="7" r="1.5" fill="currentColor"/>
                    <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="16" cy="17" r="1.5" fill="currentColor"/>
                </svg>
            `

            const titleButton = document.createElement('button')
            titleButton.type = 'button'
            titleButton.className = 'je-callout-title-btn'

            const icon = document.createElement('span')
            icon.className = 'je-callout-icon'
            const title = document.createElement('span')
            title.className = 'je-callout-title'
            titleButton.append(icon, title)
            header.append(dragHandle, titleButton)

            const contentDOM = document.createElement('div')
            contentDOM.className = 'je-callout-body'

            dom.append(header, contentDOM)
            wrapper.appendChild(dom)

            const clearHideTimer = () => {
                if (hideHandleTimer) {
                    window.clearTimeout(hideHandleTimer)
                    hideHandleTimer = null
                }
            }

            const showHandle = () => {
                clearHideTimer()
                wrapper.classList.add('is-handle-visible')
            }

            const scheduleHideHandle = () => {
                clearHideTimer()
                if (wrapper.classList.contains('ProseMirror-selectednode')) return
                hideHandleTimer = window.setTimeout(() => {
                    wrapper.classList.remove('is-handle-visible')
                }, HANDLE_HIDE_DELAY)
            }

            const closePopover = () => {
                if (!popover) return
                popover.remove()
                popover = null
                document.removeEventListener('mousedown', handleOutsideClick, true)
                window.removeEventListener('scroll', closePopover, true)
                window.removeEventListener('resize', closePopover, true)
            }

            const handleOutsideClick = (event) => {
                if (popover?.contains(event.target) || titleButton.contains(event.target)) return
                closePopover()
            }

            const setNodeSelection = () => {
                const pos = getPos()
                const { state, view } = editor
                view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
                view.focus()
            }

            const openPopover = () => {
                closePopover()
                popover = document.createElement('div')
                popover.className = 'je-popover je-callout-type-popover'

                CALLOUT_TYPES.forEach((typeDef) => {
                    const item = document.createElement('button')
                    item.type = 'button'
                    item.className = 'je-callout-item'

                    const badge = document.createElement('span')
                    badge.className = 'je-callout-badge'
                    badge.textContent = 'C'
                    badge.style.color = typeDef.textColor
                    badge.style.background = typeDef.backgroundColor

                    const content = document.createElement('span')
                    content.className = 'je-callout-content'

                    const label = document.createElement('span')
                    label.className = 'je-callout-label'
                    label.textContent = typeDef.label

                    const short = document.createElement('span')
                    short.className = 'je-callout-short'
                    short.textContent = typeDef.shortLabel

                    content.append(label, short)
                    item.append(badge, content)
                    item.addEventListener('click', () => {
                        editor.chain().focus().setCalloutType(typeDef.value).run()
                        closePopover()
                    })
                    popover.appendChild(item)
                })

                document.body.appendChild(popover)
                const rect = titleButton.getBoundingClientRect()
                popover.style.top = `${rect.bottom + window.scrollY + 8}px`
                popover.style.left = `${Math.max(12, rect.left + window.scrollX)}px`

                document.addEventListener('mousedown', handleOutsideClick, true)
                window.addEventListener('scroll', closePopover, true)
                window.addEventListener('resize', closePopover, true)
            }

            dragHandle.addEventListener('mousedown', (event) => {
                event.preventDefault()
                event.stopPropagation()
                showHandle()
                setNodeSelection()
            })
            dragHandle.addEventListener('click', (event) => {
                event.preventDefault()
                event.stopPropagation()
                showHandle()
                setNodeSelection()
            })
            titleButton.addEventListener('mousedown', (event) => {
                event.preventDefault()
                event.stopPropagation()
            })
            titleButton.addEventListener('click', (event) => {
                event.preventDefault()
                event.stopPropagation()
                openPopover()
            })

            wrapper.addEventListener('mouseenter', showHandle)
            wrapper.addEventListener('mouseleave', scheduleHideHandle)

            const render = (targetNode) => {
                const typeDef = getCalloutType(targetNode.attrs.type)
                wrapper.style.setProperty('--je-callout-color', targetNode.attrs.textColor)
                wrapper.style.setProperty('--je-callout-bg', targetNode.attrs.backgroundColor)
                icon.innerHTML = iconMarkup(typeDef)
                title.textContent = targetNode.attrs.title
            }

            render(node)

            return {
                dom: wrapper,
                contentDOM,
                update(updatedNode) {
                    if (updatedNode.type.name !== 'callout') return false
                    render(updatedNode)
                    return true
                },
                selectNode() {
                    wrapper.classList.add('ProseMirror-selectednode', 'is-handle-visible')
                    clearHideTimer()
                },
                deselectNode() {
                    wrapper.classList.remove('ProseMirror-selectednode')
                    scheduleHideHandle()
                },
                stopEvent(event) {
                    return dragHandle.contains(event.target) || titleButton.contains(event.target)
                },
                destroy() {
                    clearHideTimer()
                    closePopover()
                },
            }
        }
    },
})
