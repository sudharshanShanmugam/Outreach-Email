import { createTheme, PaletteMode, alpha, Theme } from '@mui/material/styles'

// ── Palette tokens per mode ────────────────────────────────────────────────
const dark = {
  bg:        '#07071a',
  paper:     '#0d0d22',
  paperEl:   '#13132e',
  border:    'rgba(255,255,255,0.07)',
  borderHov: 'rgba(99,102,241,0.45)',
  divider:   'rgba(255,255,255,0.07)',
  textPri:   '#eeeeff',
  textSec:   '#8888c0',
  textMut:   '#4a4a80',
  primary:   '#6366f1',
  priLight:  '#a5b4fc',
  priDark:   '#4f46e5',
  secondary: '#a855f7',
  success:   '#10b981',
  sucLight:  '#34d399',
  warning:   '#f59e0b',
  warnLight: '#fbbf24',
  error:     '#ef4444',
  errLight:  '#f87171',
  info:      '#3b82f6',
  infoLight: '#60a5fa',
  appBar:    'rgba(7,7,26,0.85)',
  cardBg:    'linear-gradient(145deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)',
  glassBar:  'rgba(255,255,255,0.025)',
}

const light = {
  bg:        '#f3f3ff',
  paper:     '#ffffff',
  paperEl:   '#f0efff',
  border:    'rgba(79,70,229,0.12)',
  borderHov: 'rgba(79,70,229,0.45)',
  divider:   'rgba(79,70,229,0.1)',
  textPri:   '#14143a',
  textSec:   '#52527e',
  textMut:   '#9898be',
  primary:   '#4f46e5',
  priLight:  '#6366f1',
  priDark:   '#3730a3',
  secondary: '#7c3aed',
  success:   '#059669',
  sucLight:  '#10b981',
  warning:   '#d97706',
  warnLight: '#f59e0b',
  error:     '#dc2626',
  errLight:  '#ef4444',
  info:      '#2563eb',
  infoLight: '#3b82f6',
  appBar:    'rgba(243,243,255,0.88)',
  cardBg:    '#ffffff',
  glassBar:  'rgba(79,70,229,0.04)',
}

// ── Factory ────────────────────────────────────────────────────────────────
export function createAppTheme(mode: PaletteMode) {
  const t = mode === 'dark' ? dark : light

  return createTheme({
    palette: {
      mode,
      primary:    { main: t.primary, light: t.priLight, dark: t.priDark, contrastText: '#fff' },
      secondary:  { main: t.secondary },
      success:    { main: t.success,  light: t.sucLight  },
      warning:    { main: t.warning,  light: t.warnLight },
      error:      { main: t.error,    light: t.errLight  },
      info:       { main: t.info,     light: t.infoLight },
      background: { default: t.bg, paper: t.paper },
      text:       { primary: t.textPri, secondary: t.textSec, disabled: t.textMut },
      divider:    t.divider,
    },

    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
    },

    shape: { borderRadius: 10 },

    shadows: [
      'none',
      mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(79,70,229,0.08)',
      mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(79,70,229,0.10)',
      mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(79,70,229,0.12)',
      mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(79,70,229,0.14)',
      ...Array(20).fill(mode === 'dark' ? '0 12px 48px rgba(0,0,0,0.6)' : '0 12px 48px rgba(79,70,229,0.16)'),
    ] as Theme['shadows'],

    components: {
      // ── Global CSS ──────────────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: `${mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(79,70,229,0.25)'} transparent`,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(79,70,229,0.25)',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: mode === 'dark' ? 'rgba(255,255,255,0.26)' : 'rgba(79,70,229,0.45)',
            },
          },
        },
      },

      // ── AppBar ──────────────────────────────────────────────────────────
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: t.appBar,
            backdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${t.border}`,
            boxShadow: mode === 'light' ? '0 1px 0 rgba(79,70,229,0.08)' : 'none',
          },
        },
      },

      MuiToolbar: {
        styleOverrides: { root: { minHeight: '60px !important' } },
      },

      // ── Paper ───────────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: t.paper,
          },
          elevation1: {
            boxShadow: mode === 'light' ? '0 1px 4px rgba(79,70,229,0.10)' : 'none',
            border: `1px solid ${t.border}`,
          },
        },
      },

      // ── Card ────────────────────────────────────────────────────────────
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: t.cardBg,
            border: `1px solid ${t.border}`,
            backdropFilter: mode === 'dark' ? 'blur(8px)' : 'none',
            boxShadow: mode === 'light' ? '0 1px 6px rgba(79,70,229,0.07)' : 'none',
            transition: 'all 0.22s ease',
            '&:hover': {
              borderColor: t.borderHov,
              transform: 'translateY(-2px)',
              boxShadow: mode === 'dark'
                ? '0 10px 40px rgba(0,0,0,0.4)'
                : '0 6px 24px rgba(79,70,229,0.14)',
            },
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '16px !important',
            '&:last-child': { paddingBottom: '16px !important' },
          },
        },
      },

      // ── Buttons ─────────────────────────────────────────────────────────
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            transition: 'all 0.18s ease',
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${t.priDark} 0%, ${t.primary} 100%)`,
            boxShadow: 'none',
            '&:hover': {
              background: `linear-gradient(135deg, ${t.priDark} 0%, ${mode === 'dark' ? '#4f46e5' : '#3730a3'} 100%)`,
              boxShadow: `0 4px 22px ${alpha(t.primary, 0.4)}`,
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
          },
          outlinedPrimary: {
            borderColor: alpha(t.primary, 0.4),
            '&:hover': {
              borderColor: t.primary,
              background: alpha(t.primary, mode === 'dark' ? 0.08 : 0.06),
            },
          },
          outlinedSecondary: {
            borderColor: alpha(t.secondary, 0.35),
            '&:hover': { borderColor: t.secondary, background: alpha(t.secondary, 0.06) },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.15s ease',
          },
        },
      },

      // ── Chip ────────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: '0.7rem',
            borderRadius: 6,
            height: 24,
          },
          icon: { fontSize: '0.85rem' },
        },
      },

      // ── TextField ───────────────────────────────────────────────────────
      MuiTextField: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: t.border },
              '&:hover fieldset': { borderColor: alpha(t.primary, 0.5) },
              '&.Mui-focused fieldset': { borderColor: t.primary },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: t.primary },
          },
        },
      },

      // ── Dialog ──────────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            background: t.paper,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            boxShadow: mode === 'dark'
              ? '0 32px 80px rgba(0,0,0,0.7)'
              : '0 24px 64px rgba(79,70,229,0.2)',
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: '1rem',
            padding: '20px 24px 14px',
            borderBottom: `1px solid ${t.border}`,
          },
        },
      },

      MuiDialogContent: {
        styleOverrides: { root: { padding: '0 !important' } },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '12px 24px 16px',
            borderTop: `1px solid ${t.border}`,
            gap: 8,
          },
        },
      },

      // ── Drawer ──────────────────────────────────────────────────────────
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            background: mode === 'dark' ? '#09091f' : '#ffffff',
            borderLeft: `1px solid ${t.border}`,
            boxShadow: mode === 'dark'
              ? '-20px 0 60px rgba(0,0,0,0.6)'
              : '-8px 0 32px rgba(79,70,229,0.12)',
          },
        },
      },

      // ── LinearProgress ──────────────────────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: alpha(t.primary, 0.12),
          },
          bar: {
            background: `linear-gradient(90deg, ${t.priDark}, ${t.secondary})`,
            borderRadius: 4,
          },
        },
      },

      // ── Alert ───────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10 },
          standardWarning: {
            background: alpha(t.warning, 0.10),
            border: `1px solid ${alpha(t.warning, 0.28)}`,
            color: t.warnLight,
          },
          standardError: {
            background: alpha(t.error, 0.10),
            border: `1px solid ${alpha(t.error, 0.28)}`,
          },
          standardSuccess: {
            background: alpha(t.success, 0.10),
            border: `1px solid ${alpha(t.success, 0.28)}`,
            color: mode === 'dark' ? t.sucLight : t.success,
          },
          standardInfo: {
            background: alpha(t.info, 0.10),
            border: `1px solid ${alpha(t.info, 0.28)}`,
          },
        },
      },

      // ── Tooltip ─────────────────────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: mode === 'dark' ? '#1c1c3a' : '#2d2d60',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
            fontSize: '0.76rem',
            borderRadius: 6,
          },
          arrow: {
            color: mode === 'dark' ? '#1c1c3a' : '#2d2d60',
          },
        },
      },

      // ── Divider ─────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: { root: { borderColor: t.border } },
      },

      // ── Avatar ──────────────────────────────────────────────────────────
      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 800, fontSize: '0.85rem', borderRadius: 8 },
        },
      },

      // ── InputAdornment icons ─────────────────────────────────────────────
      MuiInputBase: {
        styleOverrides: {
          root: { color: t.textPri },
          input: {
            '&::placeholder': { color: t.textMut, opacity: 1 },
          },
        },
      },
    },
  })
}
