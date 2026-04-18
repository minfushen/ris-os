/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 配色体系 - 浅色金融玻璃台
      colors: {
        // 背景色
        'app-bg': '#f6f8fb',
        'app-bg-start': '#eef4f3',
        'app-bg-end': '#f8fafc',

        // 主品牌色 - 冷青灰
        'primary': {
          DEFAULT: '#6f8f95',
          deep: '#4f6970',
          light: '#a8c0c3',
        },

        // 功能强调色
        'accent': {
          success: '#5f9b7a',
          warning: '#d7a85f',
          danger: '#c77b78',
        },

        // 文本颜色
        'text': {
          primary: '#1f2a30',
          secondary: '#44525a',
          muted: '#6e7c84',
          weak: '#95a2a9',
        },

        // 边框色
        'border': {
          soft: 'rgba(130, 150, 160, 0.18)',
          glass: 'rgba(255, 255, 255, 0.55)',
        },
      },

      // 玻璃材质
      backdropBlur: {
        'glass': '12px',
        'glass-strong': '20px',
      },

      // 背景色扩展
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.62)',
        'glass-strong': 'rgba(255, 255, 255, 0.74)',
        'glass-hover': 'rgba(255, 255, 255, 0.82)',
      },

      // 阴影
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'glass-sm': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 0 3px rgba(111, 143, 149, 0.15)',
      },

      // 圆角
      borderRadius: {
        'glass': '12px',
        'pill': '9999px',
      },

      // 间距
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // 字体大小
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },

      // 动画
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
