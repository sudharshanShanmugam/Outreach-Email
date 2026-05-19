import { useRef, ChangeEvent, useState, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
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
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'


import { Lead, CardStates } from '../types'
import LeadCard from './LeadCard'

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

export default function Dashboard({
  leads, cardStates, processing, doneCount, sentCount,
  onStart, onClear, onUploadMore, onEmailClick, onRemoveLead,
}: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const fileRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')

  const total   = leads.length
  const allDone = !processing && doneCount >= total && total > 0
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0

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

  const filterTabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all',        label: 'All',        count: total },
    { key: 'processing', label: 'Processing'                },
    { key: 'done',       label: 'Done',       count: doneCount },
    { key: 'sent',       label: 'Sent',       count: sentCount },
    { key: 'error',      label: 'Errors'                    },
  ]

  return (
    <Box>
      {/* ── Stats & controls bar ── */}
      <Paper elevation={0} sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '14px',
        p: 2,
        mb: 2,
        background: isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
          : theme.palette.background.paper,
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
          {/* Stat boxes */}
          <Stack direction="row" gap={3} divider={<Divider orientation="vertical" flexItem />}>
            <StatBox value={total}      label="Total Leads"  />
            <StatBox value={doneCount}  label="Processed"    color="#60a5fa" />
            <StatBox value={sentCount}  label="Sent"         color="#34d399" />
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          {/* Action buttons */}
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            {processing ? (
              <Stack direction="row" alignItems="center" gap={1}
                sx={{ px: 2, py: 0.8, bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 2 }}>
                <AutorenewRoundedIcon sx={{ fontSize: 16, color: 'warning.main', animation: 'spin 1.1s linear infinite', '@keyframes spin': { from:{transform:'rotate(0deg)'}, to:{transform:'rotate(360deg)'} } }} />
                <Typography variant="caption" fontWeight={700} color="warning.main">
                  Processing {Math.min(doneCount + 1, total)} / {total}
                </Typography>
              </Stack>
            ) : allDone ? (
              <Stack direction="row" alignItems="center" gap={0.6}
                sx={{ px: 2, py: 0.8, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 2 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" fontWeight={700} color="success.main">
                  All {total} processed
                </Typography>
              </Stack>
            ) : (
              <Button
                variant="contained"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={onStart}
                disabled={!total || processing}
                sx={{ px: 3, py: 0.9, fontSize: '0.875rem' }}
              >
                Start Processing
              </Button>
            )}

            <Tooltip title="Add more leads">
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<AddRoundedIcon />}
                sx={{ whiteSpace: 'nowrap' }}
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
              sx={{ whiteSpace: 'nowrap', borderColor: 'rgba(239,68,68,0.4)',
                    '&:hover': { bgcolor: 'rgba(239,68,68,0.08)', borderColor: 'error.main' } }}
            >
              Clear Leads
            </Button>
          </Stack>
        </Stack>

        {/* Progress bar */}
        {processing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }} />
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
              {progress}% complete
            </Typography>
          </Box>
        )}
      </Paper>


      {/* ── Filter + Search row ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems="center" mb={2.5}>
        {/* Filter tabs */}
        <Stack direction="row" gap={0.75} flexWrap="wrap">
          {filterTabs.map(t => (
            <Chip
              key={t.key}
              label={t.count !== undefined ? `${t.label} (${t.count})` : t.label}
              size="small"
              onClick={() => setFilter(t.key)}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.72rem',
                bgcolor: filter === t.key
                  ? 'rgba(99,102,241,0.15)'
                  : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(79,70,229,0.04)',
                border: `1px solid ${filter === t.key ? 'rgba(99,102,241,0.5)' : isDark ? 'rgba(255,255,255,0.09)' : 'rgba(79,70,229,0.15)'}`,
                color: filter === t.key ? 'primary.main' : 'text.secondary',
                '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' },
              }}
            />
          ))}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {/* Search */}
        <TextField
          placeholder="Search by company, name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.85rem',
              '& fieldset': { borderColor: 'divider' },
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
            '& input::placeholder': {
              color: 'text.disabled',
              fontStyle: 'italic',
              opacity: 1,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 17, color: search ? 'primary.main' : 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', cursor: 'pointer', userSelect: 'none',
                        '&:hover': { color: 'error.main' } }}
                  onClick={() => setSearch('')}
                >
                  ✕
                </Typography>
              </InputAdornment>
            ) : null,
          }}
        />
      </Stack>

      {/* ── Cards grid ── */}
      {filteredLeads.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, color: 'text.disabled' }}>
          <SearchRoundedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
          <Typography variant="body2">No leads match your filter.</Typography>
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
          '@media (max-width: 680px)':  { gridTemplateColumns: '1fr' },
        }}>
          {filteredLeads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              state={cardStates[lead.id] ?? { status: 'pending', sent: false, error: null }}
              onEmailClick={() => onEmailClick(lead.id)}
              onRemove={() => onRemoveLead(lead.id)}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function StatBox({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" fontWeight={800} sx={{ color: color ?? 'text.primary', lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem' }}>
        {label}
      </Typography>
    </Box>
  )
}
