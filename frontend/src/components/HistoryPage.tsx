import { useEffect, useState, useMemo } from 'react'
import { useTheme, keyframes } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

interface HistoryEntry {
  id: string
  lead_id: string
  company: string
  name: string
  email_address: string
  subject: string
  body: string
  sent: boolean
  sent_at: string
  date: string
  time: string
}

interface DayStat {
  date: string
  total: number
  sent: number
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(sentAt: string): string {
  return new Date(sentAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

// ── Email viewer dialog ───────────────────────────────────────────────────────
function EmailDialog({ entry, onClose }: { entry: HistoryEntry | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!entry) return
    navigator.clipboard.writeText(`Subject: ${entry.subject}\n\n${entry.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={!!entry} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', backgroundImage: 'none' } }}>
      {entry && (
        <>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>{entry.company}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.name} · {entry.email_address}
                </Typography>
              </Box>
              <Chip
                label={entry.sent ? 'Sent' : 'Generated'}
                size="small"
                sx={{
                  bgcolor: entry.sent ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                  color: entry.sent ? '#34d399' : '#818cf8',
                  border: `1px solid ${entry.sent ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                  fontWeight: 700, fontSize: '0.68rem',
                }}
              />
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <Paper elevation={0} sx={{
              p: 1.5, mb: 2, borderRadius: '10px',
              bgcolor: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <Typography variant="caption" color="text.disabled" fontWeight={700}
                sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 0.3 }}>
                Subject
              </Typography>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {entry.subject || '(no subject)'}
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{
              p: 2, borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 340,
              overflow: 'auto',
            }}>
              <Typography variant="body2" color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.75, fontSize: '0.82rem' }}>
                {entry.body}
              </Typography>
            </Paper>
            <Stack direction="row" gap={1} mt={1.5} alignItems="center">
              <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">
                {formatDate(entry.date)} at {formatTime(entry.sent_at)}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
              onClick={handleCopy} sx={{ borderRadius: '8px' }}>
              {copied ? 'Copied!' : 'Copy Email'}
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button size="small" variant="contained" onClick={onClose}
              sx={{ borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

// ── Day group row ──────────────────────────────────────────────────────────────
function DayGroup({ date, entries, onViewEmail }: {
  date: string
  entries: HistoryEntry[]
  onViewEmail: (e: HistoryEntry) => void
}) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [open, setOpen] = useState(true)
  const sentCount = entries.filter(e => e.sent).length

  return (
    <Paper elevation={0} sx={{
      border: '1px solid', borderColor: 'divider',
      borderRadius: '14px', overflow: 'hidden', mb: 2,
      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
    }}>
      {/* Day header */}
      <Stack direction="row" alignItems="center" gap={1.5} px={2} py={1.5}
        onClick={() => setOpen(o => !o)}
        sx={{
          cursor: 'pointer',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.03)',
          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)' },
        }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ flex: 1 }}>
          {formatDate(date)}
        </Typography>
        <Stack direction="row" gap={1}>
          <Chip label={`${entries.length} generated`} size="small" sx={{
            height: 20, fontSize: '0.65rem', fontWeight: 700,
            bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.25)',
          }} />
          {sentCount > 0 && (
            <Chip label={`${sentCount} sent`} size="small" sx={{
              height: 20, fontSize: '0.65rem', fontWeight: 700,
              bgcolor: 'rgba(16,185,129,0.1)', color: '#34d399',
              border: '1px solid rgba(16,185,129,0.25)',
            }} />
          )}
        </Stack>
        <IconButton size="small" sx={{ color: 'text.disabled' }}>
          {open ? <ExpandLessRoundedIcon sx={{ fontSize: 18 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Stack>

      <Collapse in={open}>
        <Divider />
        {entries.map((entry, i) => (
          <Box key={entry.id}>
            {i > 0 && <Divider sx={{ opacity: 0.4 }} />}
            <Stack direction="row" alignItems="center" gap={2} px={2} py={1.4}
              sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.02)' } }}>

              {/* Status dot */}
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                bgcolor: entry.sent ? '#34d399' : '#818cf8',
                boxShadow: `0 0 6px ${entry.sent ? 'rgba(52,211,153,0.5)' : 'rgba(129,140,248,0.5)'}`,
              }} />

              {/* Company + name */}
              <Stack sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <BusinessOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                  <Typography variant="body2" fontWeight={700} noWrap color="text.primary">
                    {entry.company}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {entry.name}{entry.email_address ? ` · ${entry.email_address}` : ''}
                </Typography>
              </Stack>

              {/* Subject */}
              <Typography variant="caption" color="text.secondary" noWrap
                sx={{ flex: 2, display: { xs: 'none', md: 'block' } }}>
                {entry.subject || '—'}
              </Typography>

              {/* Time */}
              <Stack direction="row" alignItems="center" gap={0.4} sx={{ flexShrink: 0 }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
                  {formatTime(entry.sent_at)}
                </Typography>
              </Stack>

              {/* Status chip */}
              <Chip label={entry.sent ? 'Sent' : 'Generated'} size="small" sx={{
                height: 20, fontSize: '0.63rem', fontWeight: 700, flexShrink: 0,
                bgcolor: entry.sent ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                color: entry.sent ? '#34d399' : '#818cf8',
                border: `1px solid ${entry.sent ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)'}`,
              }} />

              {/* View button */}
              <Tooltip title="View email content">
                <IconButton size="small" onClick={() => onViewEmail(entry)}
                  sx={{
                    flexShrink: 0, color: 'text.disabled',
                    '&:hover': { color: 'primary.main', bgcolor: 'rgba(99,102,241,0.08)' },
                  }}>
                  <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ))}
      </Collapse>
    </Paper>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [history, setHistory]   = useState<HistoryEntry[]>([])
  const [stats, setStats]       = useState<DayStat[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<HistoryEntry | null>(null)
  const [clearing, setClearing] = useState(false)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/history').then(r => r.json()),
      fetch('/api/history/stats').then(r => r.json()),
    ]).then(([h, s]) => {
      setHistory(h.history ?? [])
      setStats(s.stats ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleClearHistory = async () => {
    setClearing(true)
    await fetch('/api/history', { method: 'DELETE' })
    setHistory([])
    setStats([])
    setClearing(false)
  }

  const filtered = useMemo(() => {
    if (!search) return history
    const q = search.toLowerCase()
    return history.filter(e =>
      e.company.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.email_address.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q)
    )
  }, [history, search])

  const groupedByDate = useMemo(() => {
    const map: Record<string, HistoryEntry[]> = {}
    for (const e of filtered) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const totalSent = stats.reduce((a, s) => a + s.sent, 0)
  const totalGenerated = stats.reduce((a, s) => a + s.total, 0)

  return (
    <Box sx={{ animation: `${fadeUp} 0.4s ease both` }}>

      {/* ── Header ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}
        justifyContent="space-between" mb={3} gap={2}>
        <Box>
          <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
            <HistoryOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography variant="h6" fontWeight={800}>Email History</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            All generated and sent emails, grouped by date.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          color="error"
          startIcon={<DeleteOutlineIcon />}
          onClick={handleClearHistory}
          disabled={clearing || history.length === 0}
          sx={{
            borderRadius: '10px', whiteSpace: 'nowrap',
            borderColor: 'rgba(239,68,68,0.35)',
            '&:hover': { bgcolor: 'rgba(239,68,68,0.07)', borderColor: 'error.main' },
          }}
        >
          {clearing ? 'Clearing…' : 'Clear History'}
        </Button>

        <TextField
          placeholder="Search company, name, subject…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px', fontSize: '0.84rem',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              '& fieldset': { borderColor: 'divider' },
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
            '& input::placeholder': { color: 'text.disabled', fontStyle: 'italic', opacity: 1 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 17, color: search ? 'primary.main' : 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <Typography variant="caption"
                  sx={{ color: 'text.disabled', cursor: 'pointer', px: 0.5, '&:hover': { color: 'error.main' } }}
                  onClick={() => setSearch('')}>✕</Typography>
              </InputAdornment>
            ) : null,
          }}
        />
      </Stack>

      {/* ── Summary stat cards ── */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Generated', value: totalGenerated, color: '#818cf8', icon: <EmailOutlinedIcon sx={{ fontSize: 18 }} />, bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
          { label: 'Total Sent',      value: totalSent,      color: '#34d399', icon: <SendOutlinedIcon  sx={{ fontSize: 18 }} />, bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
          { label: 'Days Active',     value: stats.length,   color: '#f59e0b', icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
        ].map(s => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Paper elevation={0} sx={{
              p: 2, borderRadius: '14px',
              border: `1px solid ${s.border}`,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : s.bg,
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              <Box sx={{
                width: 42, height: 42, borderRadius: '12px',
                bgcolor: s.bg, border: `1px solid ${s.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.color, flexShrink: 0,
              }}>{s.icon}</Box>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.disabled"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.6rem', fontWeight: 600 }}>
                  {s.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Day groups ── */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 10, color: 'text.disabled' }}>
          <Typography variant="body2">Loading history…</Typography>
        </Box>
      ) : groupedByDate.length === 0 ? (
        <Paper elevation={0} sx={{
          textAlign: 'center', py: 10,
          border: '1px dashed', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          borderRadius: '16px',
          bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(99,102,241,0.02)',
        }}>
          <HistoryOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled', opacity: 0.35, mb: 1.5 }} />
          <Typography variant="body1" fontWeight={600} color="text.secondary" mb={0.5}>
            No history yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {search ? `No results for "${search}"` : 'Emails will appear here after processing'}
          </Typography>
        </Paper>
      ) : (
        groupedByDate.map(([date, entries]) => (
          <DayGroup key={date} date={date} entries={entries} onViewEmail={setSelected} />
        ))
      )}

      <EmailDialog entry={selected} onClose={() => setSelected(null)} />
    </Box>
  )
}
