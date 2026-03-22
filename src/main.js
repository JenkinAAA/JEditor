// src/main.js — 开发环境 Demo 页面入口
import './styles/editor.css'
import { JEditor } from './jeditor.js'

document.addEventListener('DOMContentLoaded', () => {
    window.editor = JEditor.create('#j-editor-container', {
        placeholder: '开始你的创作...',
    })
    console.log('[JEditor] 初始化完成 ✓')
})
