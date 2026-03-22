// src/core/config.js

/**
 * JEditor 默认配置
 *
 * toolbar: 二维数组，外层 = 行，内层 = 按钮名 / '|' 分隔线 / '->' 弹性留白
 */
export const defaultConfig = {
    placeholder: '开始在此编写文档...',

    toolbar: [
        // ---- 第一行：功能区（白色） ----
        [
            'undo', 'redo',
            '|',
            'insertImage', 'insert',
            '|',
            'attachment', 'table', 'link', 'mention',
            '|',
            'more',
            '->',
            'fullscreen',
        ],
        // ---- 第二行：格式区（灰色圆角） ----
        [
            'heading',
            '|',
            'fontFamily',
            '|',
            'fontSizeDown', 'fontSize', 'fontSizeUp',
            '|',
            'bold', 'italic', 'underline', 'strike', 'clearFormat',
            '|',
            'textColor', 'highlight',
            '|',
            'bulletList', 'orderedList', 'alignLeft', 'alignCenter', 'alignRight', 'lineHeight',
            '|',
            'blockquote', 'codeBlock',
        ],
    ],

    // 各 plugin 独立配置
    image: {
        maxSize: 20 * 1024 * 1024,
        uploadUrl: null,
        accept: 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml',
    },
}

/**
 * 合并用户配置与默认配置
 */
export function mergeConfig(userConfig = {}) {
    const merged = { ...defaultConfig, ...userConfig }
    if (userConfig.image) {
        merged.image = { ...defaultConfig.image, ...userConfig.image }
    }
    return merged
}
