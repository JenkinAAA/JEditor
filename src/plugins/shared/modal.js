function createField(labelText, inputEl) {
    const row = document.createElement('label')
    row.className = 'je-modal-field'

    const label = document.createElement('span')
    label.className = 'je-modal-label'
    label.textContent = labelText

    row.append(label, inputEl)
    return row
}

function buildTextInput(placeholder, value = '') {
    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'je-modal-input'
    input.placeholder = placeholder
    input.value = value
    return input
}

export function openLinkModal(options = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div')
        overlay.className = 'je-modal-overlay'

        const modal = document.createElement('div')
        modal.className = 'je-modal'

        const title = document.createElement('div')
        title.className = 'je-modal-title'
        title.textContent = '链接'

        const textInput = buildTextInput('输入文本', options.text || '')
        const hrefInput = buildTextInput('粘贴或输入 链接', options.href || '')

        const actions = document.createElement('div')
        actions.className = 'je-modal-actions'

        const confirmButton = document.createElement('button')
        confirmButton.type = 'button'
        confirmButton.className = 'je-modal-btn is-primary'
        confirmButton.textContent = '确定'

        const cancelButton = document.createElement('button')
        cancelButton.type = 'button'
        cancelButton.className = 'je-modal-btn'
        cancelButton.textContent = '取消'

        const close = (result = null) => {
            document.removeEventListener('keydown', onKeyDown, true)
            overlay.remove()
            resolve(result)
        }

        const onKeyDown = (event) => {
            if (event.key === 'Escape') close(null)
            if (event.key === 'Enter') {
                event.preventDefault()
                close({
                    text: textInput.value.trim(),
                    href: hrefInput.value.trim(),
                })
            }
        }

        confirmButton.addEventListener('click', () => {
            close({
                text: textInput.value.trim(),
                href: hrefInput.value.trim(),
            })
        })
        cancelButton.addEventListener('click', () => close(null))
        overlay.addEventListener('mousedown', (event) => {
            if (event.target === overlay) close(null)
        })

        actions.append(confirmButton, cancelButton)
        modal.append(
            title,
            createField('文本', textInput),
            createField('链接', hrefInput),
            actions,
        )
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
        document.addEventListener('keydown', onKeyDown, true)
        textInput.focus()
        textInput.select()
    })
}
