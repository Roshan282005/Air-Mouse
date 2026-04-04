/**
 * Ultra Instinct Neural Mentor Theme
 * 
 * Color palette extracted from Goku Ultra Instinct aura:
 * - Outer electric aura  : #00AAFF  #1AC8FF
 * - Bright cyan sparks   : #80D8FF  #B8EEFF  #E8F8FF
 * - Deep royal blue core : #0033AA  #001888
 * - Purple-blue blend    : #4422EE  #5533FF  #7755FF
 * - Space void bg        : #000005  #000108
 * - White tip highlight  : #C8E8FF  #EEF8FF
 */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(184, 238, 255, 0.08)',
          dark: 'rgba(0, 10, 40, 0.86)',
        },
        accent: {
          cyan: '#00AAFF',
          purple: '#4422EE',
        },
        arc: {
          electric: '#00AAFF',
          cyan: '#1AC8FF',
          spark: '#80D8FF',
          bright: '#B8EEFF',
          white: '#EEF8FF',
          deep: '#0033AA',
          void: '#000A40',
          purple: '#4422EE',
          'purple-hi': '#7755FF',
          violet: '#5533FF',
        },
        sp: {
          void: '#000005',
          surface: 'rgba(0, 10, 40, 0.86)',
          card: 'rgba(0, 15, 50, 0.80)',
          border: 'rgba(0, 170, 255, 0.18)',
        },
      },
      fontFamily: {
        head: ['"Chakra Petch"', 'sans-serif'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-e': '0 0 18px rgba(0,170,255,0.8), 0 0 50px rgba(0,170,255,0.3)',
        'glow-p': '0 0 18px rgba(68,34,238,0.8), 0 0 50px rgba(68,34,238,0.3)',
        'glow-combo': '0 0 40px rgba(0,170,255,0.35), 0 0 90px rgba(68,34,238,0.2), 0 0 160px rgba(0,51,170,0.12)',
      },
      animation: {
        'aura-pulse': 'auraPulse 2s infinite ease-in-out',
        'aura-flicker': 'auraFlicker 0.15s infinite alternate',
        'aura-rotate': 'auraRotate 6s linear infinite',
        'aura-rotate-reverse': 'auraRotateReverse 4s linear infinite',
        'spark-move': 'sparkMove 2s linear infinite',
        'aura-spin': 'auraspin 3s linear infinite',
        'nebuladrift': 'ndrift 18s ease-in-out infinite alternate',
        'orb-pulse': 'orbp 2.8s ease-in-out infinite',
        'status-dot': 'sdot 2.2s ease-in-out infinite',
        'name-shine': 'nshine 5s ease-in-out infinite alternate',
        'msg-in': 'msgin 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'think-fade': 'tfade 0.35s ease both',
        'think-dot': 'tdot 1.3s ease-in-out infinite',
        'progress-scan': 'pscan 1.8s linear infinite',
        'header-scan': 'hscan 3.2s ease-in-out infinite',
        'app-in': 'appin 0.9s cubic-bezier(0.16,1,0.3,1) both',
        'mic-record': 'mrecord 1s ease-in-out infinite',
        'upload-arc': 'uarc 3s ease-in-out infinite',
        'think-pulse': 'ttpulse 2s ease-in-out infinite',
      },
      keyframes: {
        auraPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        auraFlicker: {
          '0%': { filter: 'blur(20px) brightness(1)' },
          '100%': { filter: 'blur(28px) brightness(1.4)' },
        },
        auraRotate: {
          from: { transform: 'rotate(0deg) scale(1.1)' },
          to: { transform: 'rotate(360deg) scale(1.1)' },
        },
        auraRotateReverse: {
          from: { transform: 'rotate(360deg) scale(1.05)' },
          to: { transform: 'rotate(0deg) scale(1.05)' },
        },
        sparkMove: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-20px)' },
        },
        auraspin: {
          to: { transform: 'rotate(360deg)' },
        },
        ndrift: {
          from: { transform: 'translate(0, 0) scale(1)' },
          to: { transform: 'translate(18px, 14px) scale(1.07)' },
        },
        orbp: {
          '0%, 100%': {
            boxShadow: '0 0 16px rgba(0,170,255,0.9), 0 0 40px rgba(0,170,255,0.35), inset 0 0 8px rgba(26,200,255,0.25)',
          },
          '50%': {
            boxShadow: '0 0 28px rgba(26,200,255,1), 0 0 70px rgba(0,170,255,0.5), 0 0 110px rgba(68,34,238,0.28), inset 0 0 14px rgba(184,238,255,0.4)',
          },
        },
        sdot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.65' },
        },
        nshine: {
          from: { backgroundPosition: '0% 50%' },
          to: { backgroundPosition: '100% 50%' },
        },
        msgin: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        tfade: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'none' },
        },
        tdot: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-5px)', opacity: '1' },
        },
        pscan: {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        hscan: {
          '0%': { backgroundPosition: '120% 0', opacity: '0.5' },
          '50%': { backgroundPosition: '-20% 0', opacity: '1' },
          '100%': { backgroundPosition: '120% 0', opacity: '0.5' },
        },
        appin: {
          from: { opacity: '0', transform: 'translateY(22px) scale(0.97)' },
          to: { opacity: '1', transform: 'none' },
        },
        mrecord: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(248,113,113,0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(248,113,113,0)' },
        },
        uarc: {
          '0%, 100%': { borderColor: 'rgba(0,170,255,0.38)' },
          '50%': { borderColor: 'rgba(26,200,255,0.65)' },
        },
        ttpulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,170,255,0.3)' },
          '50%': { boxShadow: '0 0 18px rgba(0,170,255,0.7), 0 0 36px rgba(0,170,255,0.2)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
