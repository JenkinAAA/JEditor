import './styles/editor.css'
import { JEditor } from './jeditor.js'

document.addEventListener('DOMContentLoaded', () => {
    window.editor = JEditor.create('#j-editor-container', {
        placeholder: 'Start creating...',
    })
})
