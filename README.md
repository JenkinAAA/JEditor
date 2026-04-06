# JEditor

语言：中文 | [English](https://github.com/JenkinAAA/JEditor/blob/master/README.en.md)

仓库地址：[JenkinAAA/JEditor](https://github.com/JenkinAAA/JEditor)

当前版本：`v1.2.1`

**✨ 快速体验测试环境：**
- [👉 CDN 直连 Demo (适合独立环境)](./Demo/cdn.html)
- [👉 本地构建 Demo (适合 NPM 环境)](./Demo/npm.html)

JEditor 是一个基于 Tiptap 的混合编辑器，面向以下场景：

- 可视化富文本编辑
- Source HTML 源码编辑
- 高保真 HTML 保活与回写
- 浏览器直连和 CDN 直接使用

它适合既需要文档式编辑体验，又需要 HTML 往返稳定性的团队。

![JEditor 截图](https://raw.githubusercontent.com/JenkinAAA/JEditor/master/Demo/img.png)

图片来源：[Demo/img.png](https://github.com/JenkinAAA/JEditor/blob/master/Demo/img.png)

## 1.2.1 更新内容

本次为 bug 修复优化版本，带来了更为扎实的使用体验，主要包含以下内容：
- **Bug 修复**：修复了在 Source 源码格式化导出时，格式化器会意外在 `<pre><code>` 区块内部强加换行导致第三方渲染排版破损的问题。
- **Bug 修复**：修复了点击“全屏 / 退出全屏”或者按 ESC 后，全屏图标状态显示不同步的 bug。
- **增强**：翻新了 `Demo` 开发环境与预览界面的排版布局以及新用例支持。

---

## 1.2.0 历史更新内容

这部分升级是从 `1.0.x` 到 `1.2.0` 的一次重要升级，重点集中在表格重构、高保真能力提升，以及一批交互 bug 修复。

- 表格能力重构：
  - 支持整表拖拽手柄
  - 支持行列操作控件
  - 支持右下角缩放手柄
  - 支持行高持久化
  - 优化 Source / Visual 往返稳定性
- 代码块高保真重构：
  - 支持高保真源码输出
  - 支持第三方 HTML 环境渲染
  - 支持语法高亮标记输出
  - 优化 source 切回 visual 的稳定性
- `callout` 与 `table` 支持第三方 HTML 高保真输出
- Source 模式增强：
  - 优化 raw HTML 保活规则
  - 为保活块提供 iframe 高保真预览
- 第一层工具栏新增“导出 PDF / 打印”功能
- 链接交互优化：
  - 普通点击仅选中链接
  - `Ctrl` / `Cmd + 点击` 才会跳转
- `quote`、`divide`、`code block` 新增拖拽手柄
- 修复一批标题字号、删除线、源码预览、工具栏交互等问题

## 核心思路

JEditor 会尽量把 Source HTML 视为最终形态，在编辑过程中通过预处理与还原机制，保证复杂 HTML 能尽量保留下来。

整体流程如下：

```text
Source HTML
  -> preprocessHTML()
  -> visual projection
  -> Tiptap editing
  -> restoreRawHTML()
  -> output HTML
```

因此它非常适合需要保留复杂原生 HTML、第三方 fragment、邮件片段或非 schema 结构内容的场景。

## 主要特性

- 双层工具栏编辑器界面
- 可视化模式与源码模式双向切换
- 对不受支持节点进行 raw HTML 保活
- 支持完整 HTML 文档输入
- 富文本能力包括：
  - 标题 / 段落
  - 字体 / 字号
  - 粗体 / 斜体 / 下划线 / 删除线
  - 文字颜色
  - 对齐 / 行高
  - 无序列表 / 有序列表
  - 引用
  - 行内代码
  - 代码块
  - 链接
  - 图片
  - Callout
  - 表格
- 浏览器打印 / 导出为 PDF
- 支持 ESM / UMD / IIFE 构建产物
- 支持不依赖 npm 的 CDN 使用方式

## 高保真 HTML 策略

对于复杂节点，JEditor 采用“双形态”策略：

- 在 source 输出中保留适合第三方 HTML 环境的高保真结构
- 在 visual 编辑中使用更适合 ProseMirror / Tiptap 处理的内部结构
- 在 source / visual 切换时完成双向转换

当前重点覆盖的节点包括：

- code block
- callout
- table

## 安装

```bash
npm install @jenkin-a/jeditor
```

## 本地开发

```bash
npm install
npm run dev
npm run build
npm test
npm run preview
```

构建产物：

- `dist/jeditor.es.js`
- `dist/jeditor.umd.js`
- `dist/jeditor.iife.js`
- `dist/jeditor.css`

发版检查清单：

- `docs/release-checklist.md`

## ESM 用法

```js
import '@jenkin-a/jeditor/dist/jeditor.css'
import { JEditor } from '@jenkin-a/jeditor'

const editor = JEditor.create('#editor', {
  placeholder: '开始输入...',
})
```

也可以直接从 HTML 字符串初始化：

```js
const editor = JEditor.fromHTML('#editor', '<h2>Hello</h2><p>World</p>')
```

## CDN 用法

```html
<link rel="stylesheet" href="https://unpkg.com/@jenkin-a/jeditor@1.2.1/dist/jeditor.css" />
<script src="https://unpkg.com/@jenkin-a/jeditor@1.2.1/dist/jeditor.iife.js"></script>

<div id="editor">
  <h2>Hello, JEditor</h2>
  <p>容器中的原生 HTML 会在初始化时被解析。</p>
</div>

<script>
  const editor = window.JEditor.create('#editor', {
    placeholder: '开始输入...',
  })
</script>
```

## API

```js
editor.getHTML()
editor.getJSON()
editor.getText()
editor.setContent('<p>Hello</p>')
editor.importHTML('<p>Hello</p>')
editor.focus()
editor.destroy()
editor.toggleSourceMode()
editor.exportPDF()
```

## 适用场景

- 知识库编辑器
- 文档系统
- 需要感知 HTML 源码的 CMS 编辑器
- 同时需要 WYSIWYG 和 HTML 编辑的后台工具
- 邮件 HTML 或 fragment 工作流
- 偏向浏览器集成与 CDN 交付的场景

## 当前边界

- 仓库中暂时还没有自动化测试
- 一些 HTML 保活规则仍然是启发式策略，特殊结构可能需要继续调优
- 如果文档非常大，且包含较多保活块或高保真块，source / visual 切换可能会偏重
- PDF 导出当前走浏览器打印流程，因此“另存为 PDF”的具体体验取决于浏览器和系统

## License

MIT
