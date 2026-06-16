import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tanstackStart(), // 1. TanStack MUST go first so it can read the routes
    react(),         // 2. React goes second to handle the JSX compilation
    tailwindcss(),
    tsconfigPaths(),
    nitro()
  ]
})