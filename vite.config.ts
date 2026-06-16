import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react' // 1. Add the React plugin import

export default defineConfig({
  plugins: [
    react(), // 2. Add it to the top of the plugins array
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart(),
    nitro()
  ]
})