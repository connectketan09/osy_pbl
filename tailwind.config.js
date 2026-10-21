/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atmos: {
          bg: "#F7F7F5",
          sidebar: "#202936",
          sidebarHover: "#2A3545",
          sidebarActive: "#1B232E",
          card: "#FFFFFF",
          border: "#E2E5E8",
          borderLight: "#ECEFF1",
          primary: "#252B33",
          secondary: "#737B85",
          accent: "#526B85",
          accentHover: "#42566B",
          teal: "#638A84",
          tealHover: "#51746F",
          highlight: "#EDF1F4",
          success: "#527A62",
          successBg: "#F0F5F2",
          warning: "#A78045",
          warningBg: "#FDF9F3",
          error: "#A65D5D",
          errorBg: "#FDF5F5"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
