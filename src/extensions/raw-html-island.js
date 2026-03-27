import { Node, mergeAttributes } from '@tiptap/core'

function decodeRawHTML(rawHTML = '') {
    try {
        return decodeURIComponent(rawHTML)
    } catch {
        return rawHTML
    }
}

function summarizeRawHTML(rawHTML = '') {
    const preview = rawHTML
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180)

    return preview || 'HTML preserved'
}

export const RawHtmlIsland = Node.create({
    name: 'rawHtmlIsland',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,
    isolating: true,

    addAttributes() {
        return {
            rawHTML: {
                default: '',
                parseHTML: (element) => decodeRawHTML(element.getAttribute('data-raw-html') || ''),
                renderHTML: (attributes) => ({
                    'data-raw-html': encodeURIComponent(attributes.rawHTML || ''),
                }),
            },
            class: {
                default: null,
                parseHTML: (element) => element.getAttribute('class'),
            },
            style: {
                default: null,
                parseHTML: (element) => element.getAttribute('style'),
            },
        }
    },

    parseHTML() {
        return [{ tag: 'raw-html[data-raw-html]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['raw-html', mergeAttributes(HTMLAttributes)]
    },

    addCommands() {
        return {
            insertRawHtmlIsland: (rawHTML = '<div>\n  Raw HTML\n</div>') => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { rawHTML },
            }),
            updateRawHtmlIsland: (pos, rawHTML) => ({ state, dispatch }) => {
                const node = state.doc.nodeAt(pos)
                if (!node || node.type.name !== this.name) return false

                if (dispatch) {
                    dispatch(state.tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        rawHTML,
                    }))
                }

                return true
            },
        }
    },

    addNodeView() {
        return ({ node, editor, getPos }) => {
            let currentNode = node
            let isEditing = false

            const wrapper = document.createElement('div')
            wrapper.className = 'raw-html-island'

            const header = document.createElement('div')
            header.className = 'raw-html-island__header'
            header.textContent = 'Raw HTML Block'

            const actions = document.createElement('div')
            actions.className = 'raw-html-island__actions'

            const editButton = document.createElement('button')
            editButton.type = 'button'
            editButton.className = 'raw-html-island__action'
            editButton.textContent = 'Edit'

            const copyButton = document.createElement('button')
            copyButton.type = 'button'
            copyButton.className = 'raw-html-island__action'
            copyButton.textContent = 'Copy'

            const deleteButton = document.createElement('button')
            deleteButton.type = 'button'
            deleteButton.className = 'raw-html-island__action is-danger'
            deleteButton.textContent = 'Delete'

            actions.append(editButton, copyButton, deleteButton)
            header.appendChild(actions)

            const preview = document.createElement('pre')
            preview.className = 'raw-html-island__body'

            const editorPane = document.createElement('div')
            editorPane.className = 'raw-html-island__editor is-hidden'

            const textarea = document.createElement('textarea')
            textarea.className = 'raw-html-island__textarea'
            textarea.spellcheck = false

            const editorActions = document.createElement('div')
            editorActions.className = 'raw-html-island__editor-actions'

            const saveButton = document.createElement('button')
            saveButton.type = 'button'
            saveButton.className = 'raw-html-island__action is-primary'
            saveButton.textContent = 'Save'

            const cancelButton = document.createElement('button')
            cancelButton.type = 'button'
            cancelButton.className = 'raw-html-island__action'
            cancelButton.textContent = 'Cancel'

            editorActions.append(saveButton, cancelButton)
            editorPane.append(textarea, editorActions)

            const render = (targetNode) => {
                currentNode = targetNode
                preview.textContent = summarizeRawHTML(targetNode.attrs.rawHTML)
                if (!isEditing) {
                    textarea.value = targetNode.attrs.rawHTML || ''
                }
            }

            const enterEditMode = () => {
                isEditing = true
                textarea.value = currentNode.attrs.rawHTML || ''
                wrapper.classList.add('is-editing')
                editorPane.classList.remove('is-hidden')
                textarea.focus()
                textarea.setSelectionRange(textarea.value.length, textarea.value.length)
            }

            const leaveEditMode = (reset = false) => {
                if (reset) {
                    textarea.value = currentNode.attrs.rawHTML || ''
                }
                isEditing = false
                wrapper.classList.remove('is-editing')
                editorPane.classList.add('is-hidden')
            }

            const save = () => {
                const pos = getPos()
                const nextRawHTML = textarea.value
                editor.commands.updateRawHtmlIsland(pos, nextRawHTML)
                leaveEditMode(false)
            }

            editButton.addEventListener('click', () => {
                enterEditMode()
            })

            wrapper.addEventListener('dblclick', (event) => {
                if (event.target.closest('.raw-html-island__actions')) return
                enterEditMode()
            })

            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard?.writeText(currentNode.attrs.rawHTML || '')
                } catch {
                    /* noop */
                }
            })

            deleteButton.addEventListener('click', () => {
                const pos = getPos()
                const tr = editor.state.tr.delete(pos, pos + currentNode.nodeSize)
                editor.view.dispatch(tr)
                editor.commands.focus()
            })

            saveButton.addEventListener('click', save)
            cancelButton.addEventListener('click', () => leaveEditMode(true))
            textarea.addEventListener('keydown', (event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault()
                    save()
                }

                if (event.key === 'Escape') {
                    event.preventDefault()
                    leaveEditMode(true)
                }
            })

            render(node)
            wrapper.append(header, preview, editorPane)

            return {
                dom: wrapper,
                update(updatedNode) {
                    if (updatedNode.type.name !== 'rawHtmlIsland') return false
                    render(updatedNode)
                    return true
                },
                stopEvent(event) {
                    return wrapper.contains(event.target)
                },
            }
        }
    },
})
