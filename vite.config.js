import { defineConfig } from 'vite'

export default defineConfig({
    root: '.',
    server: {
        port: 3000,
        open: true,
    },
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'JEditor',
            formats: ['es', 'umd'],
            fileName: (format) => `jeditor.${format}.js`,
        },
        rollupOptions: {
            // Tiptap / ProseMirror 作为 peerDependency 不打入包
            external: [
                '@tiptap/core',
                '@tiptap/starter-kit',
                '@tiptap/extension-underline',
                '@tiptap/extension-image',
                '@tiptap/pm',
            ],
            output: {
                globals: {
                    '@tiptap/core': 'TiptapCore',
                    '@tiptap/starter-kit': 'StarterKit',
                    '@tiptap/extension-underline': 'TiptapUnderline',
                    '@tiptap/extension-image': 'TiptapImage',
                    '@tiptap/pm': 'TiptapPM',
                },
            },
        },
        outDir: 'dist',
        cssFileName: 'jeditor',
    },
})
