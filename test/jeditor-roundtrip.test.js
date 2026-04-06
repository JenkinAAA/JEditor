import { afterEach, describe, expect, it } from 'vitest'

import { JEditor } from '../src/jeditor.js'

function createHost() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  return host
}

describe('JEditor round-trip fidelity', () => {
  let host = null
  let editor = null

  afterEach(() => {
    editor?.destroy()
    host?.remove()
    editor = null
    host = null
    document.body.innerHTML = ''
  })

  it('keeps high-fidelity code block content after source/visual toggling', () => {
    host = createHost()
    editor = JEditor.create(host, { content: '<p></p>' })

    const html = `
            <p></p>
            <div data-jeditor-code-block="" data-code-language="plaintext" class="je-code-block-wrap" style="margin:1em 0;">
                <div class="je-code-block-header" contenteditable="false">
                    <span class="je-code-block-language">Plain Text</span>
                </div>
                <pre>
                    <code class="language-plaintext">CDN bootstrap</code>
                </pre>
            </div>
            <p></p>
        `

    editor.setContent(html)
    editor.toggleSourceMode(true)
    editor.toggleSourceMode(false)

    const output = editor.getHTML()

    expect(output).toContain('data-jeditor-code-block')
    expect(output).toContain('CDN bootstrap')
  })

  it('keeps callout and table high-fidelity wrappers in exported html', () => {
    host = createHost()
    editor = JEditor.create(host, { content: '<p></p>' })

    const html = `
            <div data-callout="" data-callout-type="info" data-callout-title="Info" data-callout-color="#2563eb" data-callout-bg="#eff6ff" class="je-callout" style="margin:12px 0;padding:14px 16px 16px;border-radius:14px;background:#eff6ff;color:#2563eb;border:1px solid rgba(37,99,235,0.12);">
                <div class="je-callout-header" contenteditable="false" style="display:flex;align-items:center;gap:8px;margin-bottom:12px;user-select:none;">
                    <span class="je-callout-title" style="font-size:14px;font-weight:700;color:inherit;">Info</span>
                </div>
                <div class="je-callout-body" style="min-height:24px;color:inherit;">
                    <p>Callout body</p>
                </div>
            </div>
            <div data-jeditor-table-wrapper="" class="je-table-wrap" style="overflow-x:auto;width:100%;margin:1em 0;">
                <table class="je-table" style="width:100%;">
                    <tbody>
                        <tr>
                            <th style="background:#f8fafc;">Head</th>
                            <th style="background:#f8fafc;">Value</th>
                        </tr>
                        <tr>
                            <td>Alpha</td>
                            <td>Beta</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `

    editor.setContent(html)
    const output = editor.getHTML()
    const doc = new DOMParser().parseFromString(output, 'text/html')
    const firstHeader = doc.querySelector('th')
    const firstCell = doc.querySelector('td')

    expect(output).toContain('data-callout')
    expect(output).toContain('Callout body')
    expect(output).toContain('data-jeditor-table-wrapper')
    expect(output).toContain('Alpha')
    expect(firstHeader?.getAttribute('style') || '').toContain('border')
    expect(firstCell?.getAttribute('style') || '').toContain('border')
  })
})
