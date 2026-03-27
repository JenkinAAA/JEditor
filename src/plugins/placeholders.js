function createPlaceholderPlugin(name, toolbar) {
    return {
        name,
        toolbar,
        tiptapExtension: null,
        command: () => {},
        isActive: () => false,
        isDisabled: () => true,
    }
}

export const attachment = createPlaceholderPlugin('attachment', {
    icon: 'paperclip',
    title: '附件',
    className: 'is-muted',
})

export const mention = createPlaceholderPlugin('mention', {
    icon: 'at-sign',
    title: '提及',
    className: 'is-muted',
})

export const placeholderPlugins = [
    attachment,
    mention,
]
