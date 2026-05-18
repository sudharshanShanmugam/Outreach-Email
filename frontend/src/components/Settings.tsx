import { useState, ChangeEvent } from 'react'
import { useTheme } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { SmtpStatus, SmtpSavePayload } from '../types'

interface Props {
  open: boolean
  smtp: SmtpStatus
  onSave: (config: SmtpSavePayload) => Promise<unknown>
  onClose: () => void
}

export default function Settings({ open, smtp, onSave, onClose }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [form, setForm] = useState<SmtpSavePayload>({
    user:      smtp.user      || '',
    password:  '',
    host:      smtp.host      || 'smtp.gmail.com',
    port:      smtp.port      || 587,
    from_name: smtp.from_name || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [err,    setErr]    = useState<string | null>(null)

  const set = (key: keyof SmtpSavePayload) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: key === 'port' ? Number(e.target.value) : e.target.value }))

  const handleSave = async () => {
    if (!form.user) { setErr('Email address is required.'); return }
    setSaving(true)
    setErr(null)
    setSaved(false)
    try {
      await onSave(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Settings</Typography>
          <Typography variant="caption" color="text.secondary">SMTP email configuration</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
        {/* SMTP status badge */}
        <Chip
          icon={smtp.configured ? <CheckCircleOutlineIcon /> : <EmailOutlinedIcon />}
          label={smtp.configured ? `Connected · ${smtp.user}` : 'Not configured'}
          size="small"
          sx={{
            mb: 3,
            bgcolor: smtp.configured ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${smtp.configured ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.25)'}`,
            color: smtp.configured ? 'success.main' : 'warning.main',
            fontWeight: 700,
            height: 28,
            '& .MuiChip-icon': { color: 'inherit', fontSize: '0.85rem' },
          }}
        />

        <Stack gap={2.5}>
          <TextField
            label="Gmail / SMTP address"
            type="email"
            placeholder="you@gmail.com"
            value={form.user}
            onChange={set('user')}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="App Password"
            type="password"
            placeholder="16-character app password"
            value={form.password}
            onChange={set('password')}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            helperText={
              <Typography variant="caption" color="text.disabled">
                Not your Gmail password.{' '}
                <Link
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener"
                  sx={{ color: 'primary.light' }}
                >
                  Generate one here ↗
                </Link>
              </Typography>
            }
          />

          <TextField
            label="Sender Name"
            placeholder="Your Name or Company"
            value={form.from_name}
            onChange={set('from_name')}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <Divider sx={{ my: -0.5 }}>
            <Typography variant="caption" color="text.disabled">Advanced</Typography>
          </Divider>

          <Stack direction="row" gap={1.5}>
            <TextField
              label="SMTP Host"
              value={form.host}
              onChange={set('host')}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DnsOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Port"
              type="number"
              value={form.port}
              onChange={set('port')}
              sx={{ width: 100, flexShrink: 0 }}
            />
          </Stack>
        </Stack>

        {/* Feedback */}
        <Box sx={{ mt: 3 }}>
          {saved && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleOutlineIcon />}>
              Configuration saved for this session.
            </Alert>
          )}
          {err && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr(null)}>
              {err}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSave}
            disabled={saving}
            sx={{ py: 1.2, fontSize: '0.9rem' }}
          >
            {saving ? 'Saving…' : 'Save Configuration'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Help note */}
        <Box sx={{
          p: 2,
          bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(79,70,229,0.04)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.65, display: 'block' }}>
            <strong style={{ color: isDark ? '#9191c0' : '#4f46e5' }}>Gmail setup:</strong> Go to{' '}
            <strong>Google Account → Security → 2-Step Verification → App Passwords</strong>
            {' '}and create a password for "Mail". Paste it above.
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
            To persist across restarts, add <code>SMTP_USER</code> and <code>SMTP_PASSWORD</code> to your <code>.env</code> file.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  )
}
