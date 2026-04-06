import { ICONS } from './shared/icon-set.js'

const controllerMap = new WeakMap()

export default {
  name: 'exportPdf',
  toolbar: {
    icon: ICONS.printer,
    title: 'Export PDF / Print',
  },
  tiptapExtension: null,
  init(editor, config = {}) {
    controllerMap.set(editor, config.controller || null)
  },
  command(editor) {
    controllerMap.get(editor)?.export?.()
  },
  isActive: () => false,
}
