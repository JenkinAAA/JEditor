# JEditor

当前版本：v1.0.0

轻量富文本编辑器，基于 Tiptap，采用插件驱动的工具栏设计，并提供简单的 DOM API（`JEditor.create`）。当前优先支持 ESM / Vite 方式；完整的 CDN / UMD 自包含包将在后续版本补全。

![示例截图](img.png)

---

## 现有功能
- ESM 构建输出
- 基础 UMD shell（Tiptap 作为 external，后续会做自包含版本）
- 基础文本格式：
  - 粗体（bold）
  - 斜体（italic）
  - 下划线（underline）
  - 删除线（strike）
  - 撤销 / 重做（undo / redo）
  - 清除格式（clear format）
- 图片插件：
  - 支持粘贴图片
  - 支持 base64 方式插入
  - 支持拖拽调整大小
  - 预留 `uploadUrl` 上传接口（待实现）

## 快速开始（开发模式）
```bash
npm install
npm run dev
npm run build
npm run preview
```

## 在项目中使用（ESM）
```js
import 'jeditor/dist/jeditor.css'
import { JEditor } from '@jenkin-a/jeditor'

const editor = JEditor.create('#j-editor-container', {
  placeholder: '开始你的创作...',
  image: { uploadUrl: null }, // 后续会接入真实上传
})

// 读取内容
editor.getHTML()
editor.getJSON()
editor.getText()
// 写入内容
editor.setContent('<p>Hello</p>')
```

需在你的项目中安装的 peer 依赖：
```
@tiptap/core
@tiptap/starter-kit
@tiptap/extension-underline
@tiptap/extension-image
@tiptap/pm
```

## 路线图
1. v1.0.0：仓库规范化（README、git 初始化、包元信息）。
2. v1.0.1：真正可用的 CDN / IIFE 自包含版本，开箱即用的 HTML 解析。
3. v1.1.x：补齐基础编辑能力（标题、列表、对齐、文本/背景色、字号/字体、链接、代码块/行内代码、表格、上传链路等）。
4. v1.2.x：Source HTML 模式（可视化 ↔ HTML 双向切换，定义允许/规范化的 HTML 边界）。

## 已知限制
- 当前 UMD 依赖外部 Tiptap 全局变量，尚未做到单文件 CDN。
- 工具栏里有占位按钮（详见 `src/plugins/placeholders.js`），功能待实现。
- 图片上传仍是 base64，`uploadUrl` 仅预留。
- 默认配置使用 `image` 键，插件名为 `insertImage`，需要在 v1.0.1 对齐。

## 关键文件
- src/jeditor.js — 公共 API 与启动流程
- src/core/plugin-manager.js — 插件注册与生命周期
- src/core/config.js — 默认配置与合并
- src/toolbar/ui.js — 工具栏 DOM 与事件绑定
- src/editor/index.js — 创建 Tiptap 编辑器实例
- src/plugins/ — 已实现插件与占位插件

## 许可
MIT

