import { describe, expect, it } from 'vitest'

import { preprocessHTML, restoreRawHTML } from '../src/core/html-preservation.js'

describe('html preservation', () => {
  it('normalizes exported code blocks for visual mode without dropping code content', () => {
    const html = `
            <div data-jeditor-code-block="" data-code-language="plaintext" class="je-code-block-wrap">
                <div class="je-code-block-header" contenteditable="false">
                    <span class="je-code-block-language">Plain Text</span>
                </div>
                <pre>
                    <code class="language-plaintext">CDN bootstrap</code>
                </pre>
            </div>
        `

    const normalized = preprocessHTML(html)

    expect(normalized).toContain('pre data-jeditor-code-block=""')
    expect(normalized).toContain('data-code-language="plaintext"')
    expect(normalized).toContain('language-plaintext')
    expect(normalized).toContain('CDN bootstrap')
    expect(normalized).not.toContain('je-code-block-header')
  })

  it('unwraps editor table wrappers and maps colgroup width to colwidth during visual preprocessing', () => {
    const html = `
            <div data-jeditor-table-wrapper="" class="je-table-wrap">
                <table class="je-table">
                    <colgroup>
                        <col style="width: 120px;">
                        <col style="width: 180px;">
                    </colgroup>
                    <tbody>
                        <tr>
                            <td>Alpha</td>
                            <td>Beta</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `

    const normalized = preprocessHTML(html)

    expect(normalized).toContain('<table')
    expect(normalized).toContain('colwidth="120"')
    expect(normalized).toContain('colwidth="180"')
    expect(normalized).not.toContain('data-jeditor-table-wrapper')
    expect(normalized).not.toContain('<colgroup')
  })

  it('preserves styled third-party fragments as raw html placeholders and restores them back', () => {
    const html = `
            <div class="vendor-email" style="padding: 24px; border: 1px solid #ddd;">
                <p style="margin: 0; color: #333;">Hello</p>
                <div class="vendor-block">
                    <span style="font-weight: 700;">World</span>
                    <span class="token keyword">!</span>
                </div>
            </div>
        `

    const preprocessed = preprocessHTML(html)
    const restored = restoreRawHTML(preprocessed)

    expect(preprocessed).toContain('<raw-html')
    expect(restored).toContain('vendor-email')
    expect(restored).toContain('font-weight: 700;')
    expect(restored).toContain('token keyword')
  })
})
