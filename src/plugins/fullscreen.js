import { ICONS } from './shared/icon-set.js'

function getContainer(editor) {
    return editor.options.element?.closest('.je-container')
}

function setFullscreenState(container, isFullscreen) {
    if (!container) return
    container.classList.toggle('je-is-fullscreen', isFullscreen)
}

export default {
    name: 'fullscreen',
    toolbar: {
        icon: ICONS.maximize,
        title: '全屏',
    },
    tiptapExtension: null,
    command: async (editor) => {
        const container = getContainer(editor)
        if (!container) return

        if (document.fullscreenElement === container) {
            await document.exitFullscreen()
            setFullscreenState(container, false)
            return
        }

        await container.requestFullscreen?.()
        setFullscreenState(container, true)
    },
    isActive: (editor) => document.fullscreenElement === getContainer(editor),
    getToolbarState(editor) {
        const active = document.fullscreenElement === getContainer(editor)
        return {
            icon: active ? ICONS.minimize : ICONS.maximize,
            title: active ? '退出全屏' : '全屏',
        }
    },
    init(editor, config = {}) {
        const container = getContainer(editor)
        const sync = () => {
            setFullscreenState(container, document.fullscreenElement === container)
            config.controller?.sync?.()
        }
        this._onFsChange = sync
        document.addEventListener('fullscreenchange', sync)
    },
    destroy() {
        if (this._onFsChange) {
            document.removeEventListener('fullscreenchange', this._onFsChange)
            this._onFsChange = null
        }
        document.querySelectorAll('.je-container.je-is-fullscreen').forEach((container) => {
            container.classList.remove('je-is-fullscreen')
        })
    },
}
