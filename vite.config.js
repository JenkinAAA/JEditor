const externalDeps = [
    '@tiptap/core',
    '@tiptap/extension-code-block-lowlight',
    '@tiptap/starter-kit',
    '@tiptap/extension-underline',
    '@tiptap/extension-image',
    '@tiptap/extension-link',
    '@tiptap/extension-table',
    'lowlight',
    '@tiptap/pm',
]

export default {
    root: '.',
    server: {
        port: 3000,
        open: true,
    },
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'JEditor',
            formats: ['es'],
            fileName: () => 'jeditor.es.js',
        },
        rollupOptions: {
            external: externalDeps,
        },
        outDir: 'dist',
        cssFileName: 'jeditor',
    },
}
