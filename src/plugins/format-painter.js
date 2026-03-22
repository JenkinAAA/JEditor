// src/plugins/format-painter.js
export default {
    name: 'formatPainter',
    toolbar: {
        icon: 'edit-3',
        title: '格式刷',
    },
    tiptapExtension: null,
    command: () => console.log('[JEditor] 格式刷功能待实现'),
    isActive: () => false,
}
