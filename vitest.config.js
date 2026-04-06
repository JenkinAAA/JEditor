import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    css: false,
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.js'],
  },
})
