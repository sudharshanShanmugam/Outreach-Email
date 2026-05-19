import { alpha, useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { Lead, CardState, RoleTier } from '../types'

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<RoleTier, { label: string; color: string; bg: string }> = {
  c_suite:     { label: 'C-Suite',   color: '#a5b4fc', bg: 'rgba(99,102,241,0.15)'  },
  vp_dir:      { label: 'VP / Dir',  color: '#34d399', bg: 'rgba(16,185,129,0.12)'  },
  manager:     { label: 'Manager',   color: '#6ee7b7', bg: 'rgba(16,185,129,0.10)'  },
  technical:   { label: 'Technical', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)'  },
  hr:          { label: 'HR',        color: '#f9a8d4', bg: 'rgba(236,72,153,0.12)'  },
  marketing:   { label: 'Marketing', color: '#93c5fd', bg: 'rgba(59,130,246,0.12)'  },
  sales:       { label: 'Sales',     color: '#fcd34d', bg: 'rgba(245,158,11,0.10)'  },
  professional:{ label: '',          color: '#9ca3af', bg: 'rgba(156,163,175,0.08)' },
}

// ── Avatar gradient palette ───────────────────────────────────────────────────
const GRADIENTS = [
  ['#6366f1','#8b5cf6'], ['#ec4899','#f43f5e'], ['#f97316','#eab308'],
  ['#10b981','#06b6d4'], ['#3b82f6','#6366f1'], ['#a855f7','#ec4899'],
  ['#14b8a6','#22c55e'], ['#f59e0b','#ef4444'],
]
function avatarGradient(str: string): string[] {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:    { icon: <RadioButtonUncheckedIcon />, label: 'Pending',    color: '#6b7280', bg: 'rgba(107,114,128,0.1)',  border: 'rgba(107,114,128,0.2)', anim: false },
  processing: { icon: <AutorenewRoundedIcon />,     label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)',  anim: true  },
  done:       { icon: <CheckCircleOutlineIcon />,   label: 'Done',       color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)', anim: false },
  error:      { icon: <ErrorOutlineIcon />,         label: 'Error',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)',  anim: false },
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  lead: Lead
  state: CardState
  onEmailClick: () => void
  onRemove: () => void
}

export default function LeadCard({ lead, state, onEmailClick, onRemove }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { status, sent, error } = state

  const company  = lead.company    ?? '—'
  const name     = lead.name       ?? ''
  const desig    = lead.designation ?? lead.title ?? ''
  const email    = lead.email      ?? ''
  const location = lead.location   ?? ''
  const industry = lead.industry   ?? ''
  const size     = lead.company_size ?? ''
  const roleConf = ROLE_CONFIG[lead.role_tier ?? 'professional']
  const [c1, c2] = avatarGradient(company)
  const initial  = company.charAt(0).toUpperCase()
  const hasEmail = status === 'done'

  const sCfg = STATUS_CFG[status]

  // Card accent color
  const accentColor =
    status === 'processing' ? '#f59e0b' :
    sent                    ? '#10b981' :
    status === 'error'      ? '#ef4444' :
    status === 'done'       ? '#6366f1' : undefined

  return (
    <Card elevation={0} sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      border: '1px solid',
      borderColor: accentColor
        ? alpha(accentColor, 0.3)
        : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.12)',
      borderRadius: '14px',
      overflow: 'visible',
      transition: 'all 0.2s ease',
      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.95)',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: accentColor
          ? `0 8px 28px ${alpha(accentColor, 0.18)}`
          : isDark ? '0 8px 28px rgba(0,0,0,0.4)' : '0 8px 28px rgba(99,102,241,0.12)',
        borderColor: accentColor
          ? alpha(accentColor, 0.5)
          : 'rgba(99,102,241,0.35)',
      },
      ...(status === 'processing' && {
        animation: 'cardPulse 2s ease-in-out infinite',
        '@keyframes cardPulse': {
          '0%,100%': { boxShadow: `0 0 0 0 ${alpha('#f59e0b', 0)}` },
          '50%':     { boxShadow: `0 0 0 5px ${alpha('#f59e0b', 0.1)}` },
        },
      }),
    }}>
      {/* Accent top bar */}
      {accentColor && (
        <Box sx={{
          height: 3,
          borderRadius: '14px 14px 0 0',
          background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.4)})`,
        }} />
      )}

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, pb: '16px !important' }}>

        {/* ── Header ── */}
        <Stack direction="row" alignItems="flex-start" gap={1.5} mb={1.5}>
          <Avatar sx={{
            width: 42, height: 42,
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            fontSize: '1.05rem', fontWeight: 900, flexShrink: 0,
            boxShadow: `0 4px 10px ${alpha(c1, 0.35)}`,
          }}>
            {initial}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={800} noWrap
                sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
                {company}
              </Typography>
              {roleConf.label && (
                <Chip label={roleConf.label} size="small" sx={{
                  height: 17, fontSize: '0.6rem', fontWeight: 700,
                  bgcolor: roleConf.bg, color: roleConf.color,
                  border: `1px solid ${alpha(roleConf.color, 0.3)}`,
                }} />
              )}
            </Stack>
            {(name || desig) && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ lineHeight: 1.5 }}>
                {name}{name && desig ? ' · ' : ''}{desig}
              </Typography>
            )}
          </Box>

          {/* Remove button */}
          <Tooltip title="Remove lead" placement="top">
            <IconButton size="small" onClick={onRemove} disabled={status === 'processing'}
              sx={{
                width: 24, height: 24, flexShrink: 0, mt: -0.25,
                color: 'text.disabled',
                '&:hover': { color: 'error.main', bgcolor: 'rgba(239,68,68,0.08)' },
                '&.Mui-disabled': { opacity: 0.25 },
              }}>
              <CloseRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* ── Meta info ── */}
        <Stack gap={0.4} mb={1.5}>
          {email && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <EmailOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }} />
              <Typography variant="caption" color="text.disabled" noWrap sx={{ fontSize: '0.72rem' }}>
                {email}
              </Typography>
            </Stack>
          )}
          {(industry || size) && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <BusinessOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }} />
              <Typography variant="caption" color="text.disabled" noWrap sx={{ fontSize: '0.72rem' }}>
                {industry}{industry && size ? ` · ${size}` : size}
              </Typography>
            </Stack>
          )}
          {location && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <LocationOnOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }} />
              <Typography variant="caption" color="text.disabled" noWrap sx={{ fontSize: '0.72rem' }}>
                {location}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ mb: 1.5, opacity: 0.4 }} />

        {/* ── Status row ── */}
        <Stack direction="row" gap={0.6} flexWrap="wrap" mb={1.5} alignItems="center">
          <Chip
            icon={sCfg.icon}
            label={sCfg.label}
            size="small"
            sx={{
              height: 22, fontWeight: 700, fontSize: '0.67rem',
              bgcolor: sCfg.bg, color: sCfg.color,
              border: `1px solid ${sCfg.border}`,
              '& .MuiChip-icon': {
                color: sCfg.color, fontSize: '0.78rem',
                ...(sCfg.anim && {
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                }),
              },
            }}
          />
          {sent && (
            <Chip icon={<SendOutlinedIcon />} label="Sent" size="small" sx={{
              height: 22, fontWeight: 700, fontSize: '0.67rem',
              bgcolor: 'rgba(16,185,129,0.1)', color: '#34d399',
              border: '1px solid rgba(16,185,129,0.3)',
              '& .MuiChip-icon': { color: '#34d399', fontSize: '0.78rem' },
            }} />
          )}
        </Stack>

        {/* Error */}
        {status === 'error' && error && (
          <Box sx={{
            p: 1, mb: 1.5, borderRadius: '8px',
            bgcolor: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}>
            <Typography variant="caption" color="error.light" sx={{ lineHeight: 1.5, fontSize: '0.7rem' }}>
              {error.slice(0, 120)}
            </Typography>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* ── Email button ── */}
        <Tooltip title={hasEmail ? 'View generated email' : 'Email not yet generated'} placement="top">
          <span style={{ display: 'block' }}>
            <Button fullWidth variant={hasEmail ? 'contained' : 'outlined'} size="small"
              startIcon={<EmailOutlinedIcon />}
              disabled={!hasEmail}
              onClick={onEmailClick}
              sx={{
                borderRadius: '9px',
                fontSize: '0.78rem',
                py: 0.7,
                ...(hasEmail ? {
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 3px 10px rgba(99,102,241,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.45)' },
                } : {
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.15)',
                  color: 'text.disabled',
                }),
              }}
            >
              {hasEmail ? 'View Email' : 'Not Ready'}
            </Button>
          </span>
        </Tooltip>
      </CardContent>
    </Card>
  )
}
