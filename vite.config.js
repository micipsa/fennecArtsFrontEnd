/**
 * Configuration de Vite — le bundler et serveur de développement du projet.
 *
 * defineConfig() fournit l'auto-complétion dans l'IDE.
 * Le plugin @vitejs/plugin-react active le support de React
 * (JSX, Fast Refresh, etc.).
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Documentation officielle : https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
