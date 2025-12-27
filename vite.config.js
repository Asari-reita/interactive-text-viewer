// Viteの基本設定。必要なら base を設定（例：GitHub Pages で /<repo>/ 配信時）
// export default defineConfig({ base: '/<REPO_NAME>/', plugins:[vue()] })
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // base: '/', // デプロイ先でサブパスになる場合は上のコメントを参考に設定
})
