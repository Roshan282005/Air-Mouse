module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(30, 30, 46, 0.7)',
        },
        accent: {
          cyan: '#00d9ff',
          purple: '#7c3aed',
        },
      },
      spacing: {
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
