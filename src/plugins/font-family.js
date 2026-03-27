import { FontFamily } from '../extensions/font-family.js'
import { FONT_FAMILY_OPTIONS } from './shared/style-presets.js'
import { createListPopover } from './shared/popover-factory.js'

function findCurrentOption(editor) {
    const current = editor.getAttributes('fontFamily').fontFamily || null
    return FONT_FAMILY_OPTIONS.find((option) => option.value === current) || FONT_FAMILY_OPTIONS[0]
}

export default {
    name: 'fontFamily',
    toolbar: {
        text: '系统默认',
        title: '字体',
        dropdown: true,
    },
    tiptapExtension: FontFamily,
    command: (editor) => editor.chain().focus().unsetFontFamily().run(),
    isActive: (editor) => editor.isActive('fontFamily'),
    getToolbarState: (editor) => ({
        label: findCurrentOption(editor).label,
    }),
    renderPopover(editor, context) {
        return createListPopover(
            FONT_FAMILY_OPTIONS.map((option) => ({
                ...option,
                style: option.cssValue ? { fontFamily: option.cssValue } : null,
            })),
            (option) => {
                const chain = editor.chain().focus()

                if (option.value) {
                    chain.setFontFamily(option.value).run()
                } else {
                    chain.unsetFontFamily().run()
                }

                context.closePopover()
            },
            { className: 'je-popover-list--font-family je-popover--font-family' },
        )
    },
}
