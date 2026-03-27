import { ICONS } from './shared/icon-set.js'

const controllerMap = new WeakMap()

export default {
    name: 'source',
    toolbar: {
        icon: ICONS.source,
        text: 'Source',
        title: 'Source HTML',
    },
    tiptapExtension: null,
    init(editor, config = {}) {
        controllerMap.set(editor, config.controller || null)
    },
    command: (editor) => {
        controllerMap.get(editor)?.toggle()
    },
    isActive: (editor) => Boolean(controllerMap.get(editor)?.isActive()),
}
