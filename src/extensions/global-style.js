import { Extension } from '@tiptap/core'

function createAttribute(name) {
  return {
    default: null,
    parseHTML: (element) => element.getAttribute(name),
    renderHTML: (attributes) => {
      if (!attributes[name]) return {}
      return { [name]: attributes[name] }
    },
  }
}

export const GlobalStyle = Extension.create({
  name: 'globalStyle',

  addGlobalAttributes() {
    return [
      {
        types: [
          'paragraph',
          'heading',
          'blockquote',
          'bulletList',
          'orderedList',
          'listItem',
          'codeBlock',
          'genericDiv',
          'image',
          'table',
          'tableRow',
          'tableCell',
          'tableHeader',
          'callout',
          'rawHtmlIsland',
        ],
        attributes: {
          class: createAttribute('class'),
          style: createAttribute('style'),
          id: createAttribute('id'),
        },
      },
      {
        types: [
          'link',
          'bold',
          'italic',
          'underline',
          'strike',
          'fontFamily',
          'textColor',
          'highlightColor',
        ],
        attributes: {
          class: createAttribute('class'),
          style: createAttribute('style'),
        },
      },
    ]
  },
})
