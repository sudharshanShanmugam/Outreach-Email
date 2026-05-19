import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { ThemeProvider, PaletteMode } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CircularProgress from '@mui/material/CircularProgress'

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'

import { createAppTheme } from './theme'
import { Lead, CardState, CardStates } from './types'
import UploadPage from './components/UploadPage'
import Dashboard from './components/Dashboard'
import EmailModal from './components/EmailModal'
import HistoryPage from './components/HistoryPage'

type TabView = 'dashboard' | 'history'

export default function App() {
  const [mode, setMode] = useState<PaletteMode>(
    () => (localStorage.getItem('theme') as PaletteMode) || 'dark'
  )
  const theme = useMemo(() => createAppTheme(mode), [mode])

  const toggleMode = useCallback(() => {
    setMode(m => {
      const next = m === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

  const [leads, setLeads]           = useState<Lead[]>([])
  const [cardStates, setCardStates] = useState<CardStates>({})
  const [processing, setProcessing] = useState(false)
  const [emailModal, setEmailModal] = useState<string | null>(null)
  const [tab, setTab]               = useState<TabView>('dashboard')
  const [initialising, setInitialising] = useState(true)
  const sseRef = useRef<EventSource | null>(null)

  // ── SSE with auto-reconnect ───────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    sseRef.current?.close()
    const es = new EventSource('/api/process/stream')
    sseRef.current = es

    es.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data)
      if (data.type === 'initial_state') {
        setLeads(data.leads ?? [])
        setCardStates(data.card_states ?? {})
        setProcessing(data.processing ?? false)
        setInitialising(false)
      } else if (data.type === 'leads_updated') {
        setLeads(data.leads ?? [])
        setCardStates(prev => {
          const next = { ...prev }
          Object.keys(data.card_states ?? {}).forEach(id => {
            if (!next[id]) next[id] = data.card_states[id]
          })
          return next
        })
      } else if (data.type === 'processing_started') {
        setProcessing(true)
        setCardStates(data.card_states ?? {})
      } else if (data.type === 'card_update') {
        setCardStates(prev => ({
          ...prev,
          [data.lead_id]: {
            ...(prev[data.lead_id] ?? {}),
            status: data.status,
            sent:   data.sent  ?? (prev[data.lead_id]?.sent  ?? false),
            error:  data.error ?? null,
          } as CardState,
        }))
      } else if (data.type === 'complete') {
        setProcessing(false)
      } else if (data.type === 'cleared') {
        setLeads([])
        setCardStates({})
        setProcessing(false)
      }
    }

    es.onerror = () => { es.close(); setTimeout(connectSSE, 3000) }
  }, [])

  useEffect(() => {
    connectSSE()
    return () => sseRef.current?.close()
  }, [connectSSE])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { detail?: string }
      throw new Error(err.detail ?? 'Upload failed')
    }
    const data = await res.json()
    setLeads(data.leads ?? [])
    setCardStates(prev => {
      const next = { ...prev }
      ;(data.leads as Lead[]).forEach(l => {
        if (!next[l.id]) next[l.id] = { status: 'pending', sent: false, error: null }
      })
      return next
    })
    return data
  }, [])

  const handleStart = useCallback(async () => {
    setProcessing(true)
    setCardStates(prev => {
      const next: CardStates = {}
      Object.keys(prev).forEach(id => { next[id] = { status: 'pending', sent: false, error: null } })
      return next
    })
    await fetch('/api/process/start', { method: 'POST' })
  }, [])

  const handleClear = useCallback(async () => {
    await fetch('/api/leads', { method: 'DELETE' })
  }, [])

  const handleRemoveLead = useCallback(async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
  }, [])

  const doneCount = Object.values(cardStates).filter(s => s.status === 'done' || s.status === 'error').length
  const sentCount = Object.values(cardStates).filter(s => s.sent).length
  const hasLeads  = leads.length > 0

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ── Top app bar ── */}
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <EmailOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="subtitle1" fontWeight={700}
            sx={{ color: 'text.primary', letterSpacing: '-0.01em' }}>
            AI Mail Generator
          </Typography>

          {/* Tabs — only show when leads are loaded */}
          {hasLeads && (
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                ml: 2,
                minHeight: 0,
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(90deg,#6366f1,#a855f7)',
                  height: 2,
                  borderRadius: 2,
                },
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'text.secondary',
                  gap: 0.75,
                  '&.Mui-selected': { color: 'primary.main' },
                },
              }}
            >
              <Tab value="dashboard" label="Dashboard"
                icon={<DashboardOutlinedIcon sx={{ fontSize: 16 }} />}
                iconPosition="start" />
              <Tab value="history" label="History"
                icon={<HistoryOutlinedIcon sx={{ fontSize: 16 }} />}
                iconPosition="start" />
            </Tabs>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleMode} size="small"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px',
                    color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}>
              {mode === 'dark'
                ? <LightModeOutlinedIcon sx={{ fontSize: 17 }} />
                : <DarkModeOutlinedIcon  sx={{ fontSize: 17 }} />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Page content ── */}
      <Box component="main" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, minHeight: 'calc(100vh - 60px)' }}>
        {initialising ? (
          <Box sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)', gap: 2,
          }}>
            <CircularProgress size={44} thickness={3} sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
            }} />
            <Typography variant="body2" color="text.disabled" fontWeight={500}>
              Connecting…
            </Typography>
          </Box>
        ) : !hasLeads ? (
          <UploadPage onUpload={handleUpload} />
        ) : tab === 'dashboard' ? (
          <Dashboard
            leads={leads}
            cardStates={cardStates}
            processing={processing}
            doneCount={doneCount}
            sentCount={sentCount}
            onStart={handleStart}
            onClear={handleClear}
            onUploadMore={handleUpload}
            onEmailClick={setEmailModal}
            onRemoveLead={handleRemoveLead}
          />
        ) : (
          <HistoryPage />
        )}
      </Box>

      {emailModal && (
        <EmailModal
          leadId={emailModal}
          lead={leads.find(l => l.id === emailModal)}
          onClose={() => setEmailModal(null)}
        />
      )}
    </ThemeProvider>
  )
}
