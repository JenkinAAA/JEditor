import './styles/editor.css'
import { JEditor } from './jeditor.js'

const initialContent = `
  <h2>欢迎使用 JEditor 开发沙盒 (v1.2.1)</h2>
  <p>这是一个专用的本地开发演示环境。您可以直接在这里预览和调试您在 <code>src/</code> 目录下修改的代码。</p>
  
  <div data-callout="" data-callout-type="tip" data-callout-title="最新特性概览" data-callout-color="#0f766e" data-callout-bg="#ecfeff" class="je-callout" style="margin: 12px 0; padding: 14px 16px 16px; border-radius: 14px; background: #ecfeff; color: #0f766e; border: 1px solid rgba(15, 118, 110, 0.12);">
    <div class="je-callout-header" contenteditable="false" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; user-select: none;">
      <span class="je-callout-title" style="font-size: 14px; font-weight: 700; color: inherit;">最新特性概览</span>
    </div>
    <div class="je-callout-body" style="min-height: 24px; color: inherit">
      <p>1. 改进了原生的双层工具栏交互体验</p>
      <p>2. 支持表格的缩放、拖拽与高保真输出</p>
      <p>3. 强化了 Source 源码模式下的保留效果</p>
    </div>
  </div>

  <p>尝试选中一些文字，或者点击工具栏来体验各项功能！</p>
`

document.addEventListener('DOMContentLoaded', () => {
  window.editor = JEditor.create('#j-editor-container', {
    placeholder: 'Start creating...',
    content: initialContent,
  })
})
