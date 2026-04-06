# Release Checklist

This checklist is intended for JEditor `v1.2.x` release validation.

## Pre-release

- Confirm `package.json` and `package-lock.json` versions match.
- Run `npm install`.
- Run `npm run build`.
- Run `npm test`.
- Verify `dist/` is regenerated from the current source.
- Review `README.md`, `README.en.md`, `.gitignore`, and npm metadata fields.

## Core Round-trip

- Create content in visual mode, switch to source mode, then back to visual mode.
- Paste third-party HTML fragments in source mode and confirm they survive visual re-entry.
- Verify full HTML document mode still locks the correct toolbar actions until the document is edited visually.

## High-Fidelity Blocks

- `code block`
  - insert a code block in visual mode
  - switch source -> visual repeatedly
  - confirm code text, language label, wrapper style, and syntax highlight markup survive
- `callout`
  - insert and change callout type
  - confirm source output keeps `data-callout`, inline styles, and title/body structure
  - paste exported HTML into a third-party HTML tool and verify appearance
- `table`
  - insert table, add/remove rows and columns, drag the table, and resize from the bottom-right handle
  - confirm source output keeps `data-jeditor-table-wrapper`
  - switch source -> visual repeatedly and confirm content does not split or duplicate
  - paste exported HTML into a third-party HTML tool and verify border, header, and wrapper rendering

## Editing Interactions

- Verify link behavior: normal click selects, `Ctrl` / `Cmd + click` opens.
- Verify block drag handles: callout, quote, divider, code block, table.
- Verify heading sizes, especially `h4` to `h6`.
- Verify strike rendering at multiple font sizes.

## Export

- Trigger `Export PDF / Print`.
- Confirm the browser print dialog opens.
- Save once as PDF and confirm the layout matches editor output.

## Publish

- Run `npm pack` and inspect the tarball contents.
- Confirm only intended files are included.
- Publish to npm.
- Push tags / release notes to GitHub.
