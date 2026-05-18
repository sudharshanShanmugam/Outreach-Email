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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Lead, CardState, RoleTier } from '../types'

// ── Role pill config ──────────────────────────────────────────────────────────
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

// ── Avatar color from company string ─────────────────────────────────────────
const AVATAR_PALETTE = [
  '#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e',
  '#ef4444','#f97316','#eab308','#22c55e','#10b981',
  '#14b8a6','#06b6d4','#3b82f6',
]
function avatarColor(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: CardState['status'] }) {
  const cfg = {
    pending:    { icon: <RadioButtonUncheckedIcon />, label: 'Pending',    color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.25)', anim: false },
    processing: { icon: <AutorenewRoundedIcon />,     label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',   anim: true  },
    done:       { icon: <CheckCircleOutlineIcon />,   label: 'Done',       color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  anim: false },
    error:      { icon: <ErrorOutlineIcon />,         label: 'Error',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   anim: false },
  }[status]

  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '0.68rem',
        height: 22,
        '& .MuiChip-icon': {
          color: cfg.color,
          fontSize: '0.8rem',
          ...(cfg.anim && {
            animation: 'spin 1.1s linear infinite',
            '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
          }),
        },
      }}
    />
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  lead: Lead
  state: CardState
  onEmailClick: () => void
}

export default function LeadCard({ lead, state, onEmailClick }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { status, sent, error } = state
  const hasEmail   = status === 'done'
  const company    = lead.company ?? '—'
  const name       = lead.name    ?? ''
  const desig      = lead.designation ?? lead.title ?? ''
  const email      = lead.email   ?? ''
  const roleConf   = ROLE_CONFIG[lead.role_tier ?? 'professional']
  const avatarBg   = avatarColor(company)
  const initial    = company.charAt(0).toUpperCase()

  // ── Card border color by status ──────────────────────────────────────────
  const borderColor =
    status === 'processing' ? 'rgba(245,158,11,0.55)' :
    sent                    ? 'rgba(16,185,129,0.45)' :
    status === 'error'      ? 'rgba(239,68,68,0.35)'  :
    status === 'done'       ? 'rgba(59,130,246,0.25)' :
    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(79,70,229,0.14)'

  return (
    <Card
      elevation={0}
      sx={{
        borderColor,
        ...(status === 'processing' && {
          animation: 'cardPulse 1.8s ease-in-out infinite',
          '@keyframes cardPulse': {
            '0%,100%': { boxShadow: `0 0 0 0 ${alpha('#f59e0b', 0)}` },
            '50%':     { boxShadow: `0 0 0 5px ${alpha('#f59e0b', 0.12)}` },
          },
        }),
      }}
    >
      <CardContent>
        {/* Header: avatar + company + role pill */}
        <Stack direction="row" alignItems="flex-start" gap={1.5} mb={1.2}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: avatarBg, fontSize: '1rem', fontWeight: 800, flexShrink: 0 }}>
            {initial}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
                {company}
              </Typography>
              {roleConf.label && (
                <Chip
                  label={roleConf.label}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    bgcolor: roleConf.bg,
                    color: roleConf.color,
                    border: `1px solid ${alpha(roleConf.color, 0.3)}`,
                  }}
                />
              )}
            </Stack>
            {(name || desig) && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {name}{name && desig ? ' · ' : ''}{desig}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Email address */}
        {email && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 1.2 }}>
            <EmailOutlinedIcon sx={{ fontSize: 12 }} />
            {email}
          </Typography>
        )}

        {/* Industry */}
        {lead.industry && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
            {lead.industry}{lead.company_size ? ` · ${lead.company_size}` : ''}
          </Typography>
        )}

        {/* Status badges */}
        <Stack direction="row" gap={0.75} flexWrap="wrap" mb={1.5}>
          <StatusChip status={status} />
          {sent && (
            <Chip
              icon={<SendOutlinedIcon />}
              label="Sent"
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#34d399',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                '& .MuiChip-icon': { color: '#34d399', fontSize: '0.8rem' },
              }}
            />
          )}
        </Stack>

        {/* Error message */}
        {status === 'error' && error && (
          <Typography variant="caption" color="error.light" sx={{ display: 'block', mb: 1, lineHeight: 1.4 }}>
            {error.slice(0, 120)}
          </Typography>
        )}

        {/* Email content button */}
        <Tooltip title={hasEmail ? 'View the generated email' : 'Email not yet generated'} placement="top">
          <span style={{ display: 'block' }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<EmailOutlinedIcon />}
              disabled={!hasEmail}
              onClick={onEmailClick}
              sx={{
                borderColor: hasEmail
                  ? 'rgba(99,102,241,0.35)'
                  : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(79,70,229,0.14)',
                color: hasEmail ? 'primary.main' : 'text.disabled',
                fontSize: '0.78rem',
                py: 0.65,
                '&:hover': hasEmail ? {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(99,102,241,0.08)',
                } : {},
              }}
            >
              Email Content
            </Button>
          </span>
        </Tooltip>
      </CardContent>
    </Card>
  )
}
