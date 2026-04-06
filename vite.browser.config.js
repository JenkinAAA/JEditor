export default {
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/browser.js',
      name: 'JEditor',
      formats: ['umd', 'iife'],
      fileName: (format) => `jeditor.${format}.js`,
    },
    rollupOptions: {
      output: {
        exports: 'default',
      },
    },
    outDir: 'dist',
    cssFileName: 'jeditor',
  },
}
