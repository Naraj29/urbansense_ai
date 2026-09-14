/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#0f172a',
          surface: '#1e293b',
          card: '#0f172a',
          border: '#334155',
          text: '#f8fafc',
          muted: '#94a3b8',
          accent: '#2563eb',
          alert: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
