# JEditor

Language: [English](README.en.md) | 中文

开源仓库：[https://github.com/JenkinAAA/JEditor](https://github.com/JenkinAAA/JEditor)

当前版本：`v1.0.8`

JEditor 是一个面向文档写作、静态 HTML 片段编辑、Source HTML 编辑的 Web 富文本编辑器。它以 Tiptap 为基础，但当前版本已经不只是简单的工具栏封装，而是在此基础上演进成了一个同时支持可视化编辑、源码编辑、HTML 保活与 CDN 直连的混合编辑器。

![JEditor Screenshot](Demo/img.png)

## 项目目标

JEditor 的目标不是单纯复刻一个传统富文本编辑器，而是解决一个更难的问题：

`让用户既能像写文档一样编辑内容，又能尽可能保留和操作原始 HTML。`

这也是 JEditor 与常规编辑器的核心差异：

- 普通编辑器更强调“结构化内容”
- JEditor 同时强调“结构化编辑体验”和“HTML 存活能力”

## 当前能力

当前版本已经具备以下核心能力：

- 双工具栏富文本编辑体验
- 原生 HTML 容器启动
- `textarea` 启动与自动回填
- ESM / UMD / IIFE 三种构建产物
- CDN 直接接入，无需 npm
- Source 按钮切换源码编辑
- 左侧源码、右侧高保真预览
- 完整 HTML 文档保留
- fragment HTML 预处理与回写
- Raw HTML Block 占位与保活
- 基础富文本能力：
  - 撤销 / 重做
  - 格式刷
  - 清除格式
  - 标题 / 正文
  - 字体 / 字号
  - 粗体 / 斜体 / 下划线 / 删除线
  - 颜色
  - 引用
  - inline code
  - code block
  - 列表
  - 链接
  - 表格
  - 图片
  - Callout
  - 全屏

## 当前较为严重的 BUG

将在下一个版本进行更新，计划于 `2026.06` 之前完成。

- 表格设计样式仍存在缺陷，当前版本不够适合长文档阅读与编辑
- 表格交互逻辑仍存在缺陷，手柄、缩放、拖拽等相关交互代码还不稳定
- Callout 的焦点管理与交互逻辑仍存在缺陷，会影响操作体验

其它 bug 欢迎通过 [Issues](https://github.com/JenkinAAA/JEditor/issues) 提出。

## 架构概览

JEditor 当前采用的是一套“Source HTML 为唯一真相”的混合架构：

```text
Source HTML
   -> Parser / Preprocess
   -> Projection
   -> Visual Editor (Tiptap)
   -> restoreRawHTML()
   -> Output HTML
```

可以把它理解为三层：

1. Source Layer
   - 保存原始 HTML
   - 完整文档模式下保持源码权威
   - 负责高保真预览

2. Projection Layer
   - 在 `setContent` 前预处理 HTML
   - 把可识别节点交给 schema
   - 把未知节点包成 `RawHtmlIsland`

3. Visual Layer
   - 由 Tiptap 承担结构化编辑能力
   - 工具栏、插件、命令、选区逻辑都工作在这一层

## 三种编辑状态

### 1. Visual Mode

默认模式。适合写正文、排版、插入表格、Callout、图片、代码块等结构化内容。

这一层主要依赖 Tiptap 提供：

- 选区管理
- 命令链
- schema
- 历史记录
- 节点与 mark 扩展

### 2. Source Mode

点击右侧 `Source` 按钮进入。

当前实现为：

- 左侧：源码编辑区 `textarea`
- 右侧：高保真 iframe 预览

当内容是完整 HTML 文档时，JEditor 不会强制把它重新喂回可视化编辑器，从而避免：

- `<!DOCTYPE html>` 丢失
- `<head>` 丢失
- `<style>` 丢失
- `<script>` 丢失
- 文档结构被 Tiptap 规范化

### 3. Hybrid / Preservation Flow

这是 JEditor 当前最关键的一层。

对于 fragment HTML，JEditor 会在 `setContent()` 之前先做预处理：

- 支持的节点：正常解析进入编辑器
- 不支持的节点：包成 `raw-html` 占位节点

导出时再通过 `restoreRawHTML()` 还原成原始 HTML。

目标很明确：

`未知 HTML 不一定能编辑，但不能被删除。`

## HTML 保活机制

JEditor 的 HTML 保活目前可以简单理解为三步：

1. `preprocessHTML`
   - 在 `setContent()` 前执行
   - 可识别节点正常进入编辑器
   - 不可识别节点转成 `raw-html`

2. `RawHtmlIsland`
   - 作为不可拆分的块节点存在
   - 负责保存原始 HTML，而不是强行结构化解析

3. `restoreRawHTML`
   - 在 `getHTML()` 时执行
   - 把 `raw-html` 占位恢复成原始 `outerHTML`

这意味着即使某些 HTML 无法在可视化层直接编辑，导出时仍然可以尽量保持原样。

## 插件体系

JEditor 使用插件驱动工具栏和命令。

每个插件通常包含：

- `name`
- `toolbar`
- `tiptapExtension`
- `command`
- `isActive`
- `renderPopover`
- `init / destroy`

这意味着：

- UI 与命令可以解耦
- 工具栏项可以按配置组合
- 扩展新按钮时无需重写编辑器核心

## 安装与开发

```bash
npm install
npm run dev
npm run build
npm run preview
```

构建产物：

- `dist/jeditor.es.js`
- `dist/jeditor.umd.js`
- `dist/jeditor.iife.js`
- `dist/jeditor.css`

## ESM 用法

```js
import '@jenkin-a/jeditor/dist/jeditor.css'
import { JEditor } from '@jenkin-a/jeditor'

const editor = JEditor.create('#editor', {
  placeholder: '开始你的创作...',
})
```

也可以直接从 HTML 字符串创建：

```js
const editor = JEditor.fromHTML('#editor', '<h2>Hello</h2><p>World</p>')
```

## CDN / 无 npm 用法

```html
<link rel="stylesheet" href="https://unpkg.com/@jenkin-a/jeditor@1.0.8/dist/jeditor.css">
<script src="https://unpkg.com/feather-icons"></script>
<script src="https://unpkg.com/@jenkin-a/jeditor@1.0.8/dist/jeditor.iife.js"></script>

<div id="editor">
  <h2>你好，JEditor</h2>
  <p>这里的原生 HTML 会在启动时被解析。</p>
</div>

<script>
  const editor = window.JEditor.create('#editor', {
    placeholder: '开始你的创作...',
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
```

## 适用场景

JEditor 适合以下场景：

- 企业知识库编辑器
- SOP / 公告 / 文档创作台
- 支持 Source HTML 的 CMS 编辑器
- 需要可视化 + HTML 混合编辑的后台系统
- 需要 CDN 直连接入的轻量编辑器

## 当前边界

虽然当前版本已经非常强，但它仍在持续演进中。

目前仍存在一些边界：

- 部分 UI 细节仍需继续打磨
- 个别工具栏交互仍可继续优化
- 复杂未知 inline HTML 的保活能力还不是最终形态
- Source Mode 与 Hybrid Mode 还会继续深化

## License

MIT
