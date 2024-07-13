import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);
export default defineConfig({
  server: {
    port: 50714
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})