export const defaultConfig = {
    placeholder: 'Start writing...',
    toolbar: [
        [
            'undo', 'redo',
            '|',
            'insertImage', 'insert',
            '|',
            'attachment', 'mention',
            '->',
            'fullscreen',
        ],
        [
            'formatPainter', 'clearFormat',
            '|',
            'heading',
            '|',
            'fontFamily', 'fontSize',
            '|',
            'bold', 'italic', 'underline', 'strike',
            '|',
            'textColor', 'callout',
            '|',
            'bulletList', 'orderedList', 'align', 'lineHeight',
            '|',
            'inlineCode', 'codeBlock',
            '|',
            'more',
            '->',
            'source',
        ],
    ],
    image: {
        maxSize: 20 * 1024 * 1024,
        uploadUrl: null,
        accept: 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml',
    },
    source: {},
    htmlPreservation: {},
    more: {},
}

export function mergeConfig(userConfig = {}) {
    const merged = { ...defaultConfig, ...userConfig }

    if (userConfig.image) {
        merged.image = { ...defaultConfig.image, ...userConfig.image }
    }

    if (userConfig.source) {
        merged.source = { ...defaultConfig.source, ...userConfig.source }
    }

    if (userConfig.htmlPreservation) {
        merged.htmlPreservation = { ...defaultConfig.htmlPreservation, ...userConfig.htmlPreservation }
    }

    if (userConfig.more) {
        merged.more = { ...defaultConfig.more, ...userConfig.more }
    }

    return merged
}
