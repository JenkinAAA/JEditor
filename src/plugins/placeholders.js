// src/plugins/placeholders.js
// 工厂函数：批量创建待实现功能的占位 plugin

function btn(name, toolbar) {
    return {
        name,
        toolbar,
        tiptapExtension: null,
        command: () => console.log(`[JEditor] ${toolbar.title} — 待实现`),
        isActive: () => false,
    }
}

// ---- 第一行：功能区 ----
export const insert        = btn('insert',        { text: '插入',    title: '插入',   dropdown: true })
export const attachment    = btn('attachment',    { icon: 'paperclip', title: '附件' })
export const table         = btn('table',         { icon: 'grid',      title: '表格' })
export const link          = btn('link',          { icon: 'link',      title: '链接' })
export const mention       = btn('mention',       { icon: 'at-sign',   title: '提及' })
export const more          = btn('more',          { icon: 'more-horizontal', title: '更多' })
export const fullscreen    = btn('fullscreen',    { icon: 'maximize-2', title: '全屏' })

// ---- 第二行：格式区 ----
export const heading       = btn('heading',       { text: '正文',     title: '段落样式',   dropdown: true })
export const fontFamily    = btn('fontFamily',    { text: '微软雅黑',  title: '字体',       dropdown: true })
export const fontSizeDown  = btn('fontSizeDown',  { icon: 'minus',     title: '减小字号' })
export const fontSize      = btn('fontSize',      { text: '14',        title: '字号' })
export const fontSizeUp    = btn('fontSizeUp',    { icon: 'plus',      title: '增大字号' })
export const textColor     = btn('textColor',     { type: 'color', text: 'A',  colorBar: '#ef4444', title: '文字颜色' })
export const highlight     = btn('highlight',     { type: 'color', text: '笔', colorBar: '#facc15', title: '背景颜色' })
export const bulletList    = btn('bulletList',    { icon: 'list',         title: '无序列表' })
export const orderedList   = btn('orderedList',   { icon: 'hash',         title: '有序列表' })
export const alignLeft     = btn('alignLeft',     { icon: 'align-left',   title: '左对齐' })
export const alignCenter   = btn('alignCenter',   { icon: 'align-center', title: '居中' })
export const alignRight    = btn('alignRight',    { icon: 'align-right',  title: '右对齐' })
export const lineHeight    = btn('lineHeight',    { text: '1.5',          title: '行间距' })
export const blockquote    = btn('blockquote',    { icon: 'message-square', title: '引用' })
export const codeBlock     = btn('codeBlock',     { text: '</>',          title: '代码块', className: 'font-mono font-bold text-indigo-600' })

export const placeholderPlugins = [
    insert, attachment, table, link, mention, more, fullscreen,
    heading, fontFamily, fontSizeDown, fontSize, fontSizeUp,
    textColor, highlight,
    bulletList, orderedList, alignLeft, alignCenter, alignRight, lineHeight,
    blockquote, codeBlock,
]
