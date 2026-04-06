import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export function createEditor(element, pluginExtensions = [], options = {}) {
  return new Editor({
    element,
    extensions: [
      StarterKit.configure({
        history: true,
        horizontalRule: false,
        code: false,
        codeBlock: false,
        blockquote: false,
      }),
      ...pluginExtensions,
    ],
    editorProps: {
      attributes: {
        class: 'tiptap tiptap-editor',
        spellcheck: 'false',
      },
    },
    content: options.content ?? `<p>${options.placeholder || 'Start writing...'}</p>`,
  })
}
