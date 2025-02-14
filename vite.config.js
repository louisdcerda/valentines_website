import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures correct relative paths for AWS Amplify
  server: {
    port: 5173, // (Optional) Matches local testing
  },
  build: {
    outDir: 'dist', // Ensure build output is in 'dist'
  }
});

