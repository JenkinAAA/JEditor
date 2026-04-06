import './styles/editor.css'
import { JEditor } from './jeditor.js'

if (typeof globalThis !== 'undefined') {
  globalThis.JEditor = JEditor
}

export default JEditor
