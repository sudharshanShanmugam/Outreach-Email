import { useRef, ChangeEvent, useState, useMemo } from 'react'
import { useTheme, keyframes } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import AutorenewIcon from '@mui/icons-material/Autorenew'

import { Lead, CardStates } from '../types'
import LeadCard from './LeadCard'

// ── Duplicate lead type ───────────────────────────────────────────────────────
interface DupeLead { id: string; company: string; name: string; email: string; lastSent: string }

// ── Animations ────────────────────────────────────────────────────────────────
const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
`
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  leads: Lead[]
  cardStates: CardStates
  processing: boolean
  doneCount: number
  sentCount: number
  onStart: () => void
  onClear: () => void
  onUploadMore: (f: File) => Promise<unknown>
  onEmailClick: (id: string) => void
  onRemoveLead: (id: string) => void
}

type FilterTab = 'all' | 'pending' | 'processing' | 'done' | 'sent' | 'error'

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard({
  leads, cardStates, processing, doneCount, sentCount,
  onStart, onClear, onUploadMore, onEmailClick, onRemoveLead,
}: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const fileRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [dupeLeads, setDupeLeads] = useState<DupeLead[]>([])
  const [dupeDialog, setDupeDialog] = useState(false)

  const handleStartClick = async () => {
    // Check each lead's email against history
    const res = await fetch('/api/history').then(r => r.json()).catch(() => ({ history: [] }))
    const history: { email_address: string; company: string; sent_at: string }[] = res.history ?? []

    // Build map: email → most recent sent_at
    const historyMap = new Map<string, string>()
    for (const h of history) {
      if (h.email_address && !historyMap.has(h.email_address)) {
        historyMap.set(h.email_address.toLowerCase(), h.sent_at)
      }
    }

    const dupes: DupeLead[] = leads
      .filter(l => l.email && historyMap.has(l.email.toLowerCase()))
      .map(l => ({
        id: l.id,
        company: l.company ?? '',
        name: l.name ?? '',
        email: l.email ?? '',
        lastSent: historyMap.get(l.email!.toLowerCase())!,
      }))

    if (dupes.length > 0) {
      setDupeLeads(dupes)
      setDupeDialog(true)
    } else {
      onStart()
    }
  }

  const handleRegenerateAll = () => {
    setDupeDialog(false)
    onStart()
  }

  const handleRemoveDupes = async () => {
    setDupeDialog(false)
    for (const d of dupeLeads) onRemoveLead(d.id)
    // Start with remaining leads after removal
    onStart()
  }

  const total    = leads.length
  const allDone  = !processing && doneCount >= total && total > 0
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const errorCount = Object.values(cardStates).filter(s => s.status === 'error').length
  const pendingCount = Object.values(cardStates).filter(s => s.status === 'pending').length

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const cs    = cardStates[lead.id]
      const query = search.toLowerCase()
      const matchSearch =
        !search ||
        (lead.company ?? '').toLowerCase().includes(query) ||
        (lead.name    ?? '').toLowerCase().includes(query) ||
        (lead.email   ?? '').toLowerCase().includes(query)
      const matchFilter =
        filter === 'all' ||
        (filter === 'sent' && cs?.sent) ||
        (cs?.status === filter)
      return matchSearch && matchFilter
    })
  }, [leads, cardStates, search, filter])

  const filterTabs: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: 'all',        label: 'All',        count: total,        color: '#818cf8' },
    { key: 'pending',    label: 'Pending',    count: pendingCount, color: '#6b7280' },
    { key: 'processing', label: 'Processing', count: Object.values(cardStates).filter(s => s.status === 'processing').length, color: '#f59e0b' },
    { key: 'done',       label: 'Done',       count: doneCount,    color: '#60a5fa' },
    { key: 'sent',       label: 'Sent',       count: sentCount,    color: '#34d399' },
    { key: 'error',      label: 'Errors',     count: errorCount,   color: '#ef4444' },
  ]

  return (
    <Box sx={{ animation: `${fadeUp} 0.4s ease both` }}>

      {/* ── Top control bar ── */}
      <Paper elevation={0} sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        p: { xs: 2, sm: 2.5 },
        mb: 2.5,
        background: isDark
          ? 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(255,255,255,0.9) 100%)',
        boxShadow: isDark
          ? '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 1px 3px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2.5}>

          {/* Stat boxes */}
          <Stack direction="row" gap={0} divider={
            <Divider orientation="vertical" flexItem sx={{ mx: 2, opacity: 0.4 }} />
          }>
            <StatBox icon={<PeopleAltOutlinedIcon sx={{ fontSize: 16 }} />}
              value={total} label="Total" color="#818cf8" />
            <StatBox icon={<DoneAllRoundedIcon sx={{ fontSize: 16 }} />}
              value={doneCount} label="Processed" color="#60a5fa" />
            <StatBox icon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
              value={sentCount} label="Sent" color="#34d399" />
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          {/* Action buttons */}
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            {processing ? (
              <Stack direction="row" alignItems="center" gap={1} sx={{
                px: 2, py: 0.9,
                bgcolor: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '10px',
              }}>
                <AutorenewRoundedIcon sx={{
                  fontSize: 15, color: '#f59e0b',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                }} />
                <Typography variant="caption" fontWeight={700} sx={{ color: '#f59e0b' }}>
                  Processing {Math.min(doneCount + 1, total)} / {total}
                </Typography>
              </Stack>
            ) : allDone ? (
              <Stack direction="row" alignItems="center" gap={0.75} sx={{
                px: 2, py: 0.9,
                bgcolor: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '10px',
              }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#34d399' }} />
                <Typography variant="caption" fontWeight={700} sx={{ color: '#34d399' }}>
                  All {total} complete
                </Typography>
              </Stack>
            ) : (
              <Button
                variant="contained"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={handleStartClick}
                disabled={!total || processing}
                sx={{
                  px: 2.5, py: 0.85, fontSize: '0.83rem', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 18px rgba(99,102,241,0.5)' },
                }}
              >
                Start Processing
              </Button>
            )}

            <Tooltip title="Upload more leads">
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<AddRoundedIcon />}
                sx={{
                  whiteSpace: 'nowrap', borderRadius: '10px',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(99,102,241,0.05)' },
                }}
              >
                Add Leads
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const f = e.target.files?.[0]
                    if (f) { onUploadMore(f); e.target.value = '' }
                  }} />
              </Button>
            </Tooltip>

            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={onClear}
              disabled={processing}
              sx={{
                whiteSpace: 'nowrap', borderRadius: '10px',
                borderColor: 'rgba(239,68,68,0.35)',
                '&:hover': { bgcolor: 'rgba(239,68,68,0.07)', borderColor: 'error.main' },
              }}
            >
              Clear All
            </Button>
          </Stack>
        </Stack>

        {/* Progress bar */}
        {(processing || (allDone && total > 0)) && (
          <Box sx={{ mt: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {allDone ? 'Completed' : `${doneCount} of ${total} leads processed`}
              </Typography>
              <Typography variant="caption" fontWeight={700}
                sx={{ color: allDone ? '#34d399' : '#f59e0b' }}>
                {progress}%
              </Typography>
            </Stack>
            <Box sx={{ position: 'relative', height: 6, borderRadius: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <Box sx={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${progress}%`,
                borderRadius: 3,
                background: allDone
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #6366f1, #a855f7, #f59e0b)',
                backgroundSize: '400px 100%',
                transition: 'width 0.5s ease',
                ...(processing && {
                  animation: `${shimmer} 2s linear infinite`,
                }),
              }} />
            </Box>
          </Box>
        )}
      </Paper>

      {/* ── Filter + Search row ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems="center" mb={2.5}>
        <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">
          <TuneRoundedIcon sx={{ fontSize: 15, color: 'text.disabled', mr: 0.5 }} />
          {filterTabs.map(t => (
            <Chip
              key={t.key}
              label={
                <span>
                  {t.label}
                  {t.count > 0 && (
                    <span style={{
                      marginLeft: 5,
                      background: filter === t.key ? t.color + '30' : 'rgba(128,128,128,0.15)',
                      color: filter === t.key ? t.color : 'inherit',
                      borderRadius: 99,
                      padding: '0 5px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                    }}>
                      {t.count}
                    </span>
                  )}
                </span>
              }
              size="small"
              onClick={() => setFilter(t.key)}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.72rem',
                height: 26,
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                bgcolor: filter === t.key
                  ? `${t.color}18`
                  : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${filter === t.key ? t.color + '55' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                color: filter === t.key ? t.color : 'text.secondary',
                '&:hover': { bgcolor: `${t.color}12`, borderColor: t.color + '44' },
              }}
            />
          ))}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <TextField
          placeholder="Search by company, name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{
            minWidth: 290,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.84rem',
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
                  sx={{ color: 'text.disabled', cursor: 'pointer', userSelect: 'none', px: 0.5,
                        '&:hover': { color: 'error.main' } }}
                  onClick={() => setSearch('')}>✕</Typography>
              </InputAdornment>
            ) : null,
          }}
        />
      </Stack>

      {/* ── Cards grid ── */}
      {filteredLeads.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 12,
          border: '1px dashed',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          borderRadius: '16px',
          bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(99,102,241,0.02)',
        }}>
          <InboxOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled', opacity: 0.4, mb: 1.5 }} />
          <Typography variant="body1" fontWeight={600} color="text.secondary" mb={0.5}>
            No leads found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {search ? `No results for "${search}"` : 'Try a different filter'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
          '@media (max-width: 680px)':  { gridTemplateColumns: '1fr' },
        }}>
          {filteredLeads.map((lead, i) => (
            <Box key={lead.id} sx={{
              animation: `${fadeUp} 0.35s ease ${i * 0.04}s both`,
            }}>
              <LeadCard
                lead={lead}
                state={cardStates[lead.id] ?? { status: 'pending', sent: false, error: null }}
                onEmailClick={() => onEmailClick(lead.id)}
                onRemove={() => onRemoveLead(lead.id)}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* ── Duplicate email dialog ── */}
      <Dialog open={dupeDialog} onClose={() => setDupeDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              bgcolor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>Duplicate Emails Detected</Typography>
              <Typography variant="caption" color="text.secondary">
                {dupeLeads.length} lead{dupeLeads.length > 1 ? 's have' : ' has'} already been emailed before.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 1.5, pb: 1 }}>
          <List dense disablePadding>
            {dupeLeads.map((d) => (
              <ListItem key={d.id} disablePadding
                secondaryAction={
                  <Tooltip title="Remove this lead">
                    <IconButton size="small"
                      onClick={() => {
                        onRemoveLead(d.id)
                        const remaining = dupeLeads.filter(x => x.id !== d.id)
                        setDupeLeads(remaining)
                        if (remaining.length === 0) setDupeDialog(false)
                      }}
                      sx={{
                        color: 'text.disabled',
                        '&:hover': { color: 'error.main', bgcolor: 'rgba(239,68,68,0.08)' },
                      }}>
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                }
                sx={{
                  py: 0.8, px: 1.5, pr: 5,
                  borderRadius: '10px', mb: 0.5,
                  bgcolor: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={700}>{d.company}</Typography>
                      {d.name && <Typography variant="caption" color="text.secondary">· {d.name}</Typography>}
                    </Stack>
                  }
                  secondary={
                    <Stack direction="row" alignItems="center" gap={1} mt={0.2}>
                      <Typography variant="caption" color="text.disabled">{d.email}</Typography>
                      <Typography variant="caption" color="text.disabled">·</Typography>
                      <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                        Last sent {new Date(d.lastSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
          <Button size="small" variant="outlined" color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleRemoveDupes}
            sx={{ borderRadius: '9px', borderColor: 'rgba(239,68,68,0.4)' }}>
            Remove &amp; Skip
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button size="small" variant="outlined"
            onClick={() => setDupeDialog(false)}
            sx={{ borderRadius: '9px' }}>
            Cancel
          </Button>
          <Button size="small" variant="contained"
            startIcon={<AutorenewIcon sx={{ fontSize: 16 }} />}
            onClick={handleRegenerateAll}
            sx={{ borderRadius: '9px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            Regenerate Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// ── Stat box ──────────────────────────────────────────────────────────────────
function StatBox({ value, label, color, icon }: {
  value: number; label: string; color: string; icon: React.ReactNode
}) {
  return (
    <Stack alignItems="center" gap={0.3} sx={{ minWidth: 64 }}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Box sx={{ color, opacity: 0.8, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Typography variant="h5" fontWeight={800} sx={{ color, lineHeight: 1 }}>
          {value}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.disabled"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.6rem', fontWeight: 600 }}>
        {label}
      </Typography>
    </Stack>
  )
}
