import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'routing-vendor': ['react-router-dom'],
          
          // App chunks
          'auth': [
            './src/contexts/AuthContext.tsx',
            './src/api/auth.api.ts',
            './src/models/auth.types.ts'
          ],
          'location-data': ['./src/data/nzLocations.ts'],
          'profile-components': [
            './src/components/UserProfile/LocationSelector.tsx',
            './src/hooks/useLocationSelector.ts',
            './src/hooks/useUserProfileForm.ts',
            './src/utils/userProfileValidation.ts'
          ]
        }
      }
    },
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000
  },
})
