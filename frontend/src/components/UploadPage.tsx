import { useState, useRef, DragEvent, ChangeEvent, KeyboardEvent } from 'react'
import { useTheme, keyframes } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined'

interface Props {
  onUpload: (file: File) => Promise<unknown>
}

// ── Animations ────────────────────────────────────────────────────────────────

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.08); }
`

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

// ── Feature cards ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <TravelExploreIcon sx={{ fontSize: 22 }} />,
    title: 'Deep Web Research',
    desc: 'Scrapes company websites, Wikipedia, and news to build rich prospect profiles automatically.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    icon: <PsychologyAltOutlinedIcon sx={{ fontSize: 22 }} />,
    title: 'AI Intelligence Graph',
    desc: 'LangGraph pipeline analyses pain points, maps opportunities, and builds personalised context.',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.25)',
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 22 }} />,
    title: 'Hyper-personalised Emails',
    desc: 'Generates unique outreach emails per lead — referencing their specific challenges and goals.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.25)',
  },
  {
    icon: <SendOutlinedIcon sx={{ fontSize: 22 }} />,
    title: 'Auto Delivery',
    desc: 'Sends emails directly via your SMTP once generation is complete — no copy-paste needed.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    icon: <BarChartOutlinedIcon sx={{ fontSize: 22 }} />,
    title: 'Live Progress Dashboard',
    desc: "Real-time card view shows each lead's processing status with live SSE updates.",
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    icon: <PersonSearchOutlinedIcon sx={{ fontSize: 22 }} />,
    title: 'Smart Lead Parsing',
    desc: 'Auto-detects column names from any CSV or Excel format — no template required.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
  },
]

// ── Pipeline steps ─────────────────────────────────────────────────────────────

const PIPELINE = [
  { label: 'Upload',    icon: <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />, color: '#6366f1' },
  { label: 'Enrich',   icon: <TravelExploreIcon        sx={{ fontSize: 16 }} />, color: '#a855f7' },
  { label: 'Analyse',  icon: <PsychologyAltOutlinedIcon sx={{ fontSize: 16 }} />, color: '#ec4899' },
  { label: 'Generate', icon: <AutoAwesomeIcon           sx={{ fontSize: 16 }} />, color: '#f59e0b' },
  { label: 'Send',     icon: <SendOutlinedIcon          sx={{ fontSize: 16 }} />, color: '#10b981' },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function UploadPage({ onUpload }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File | undefined) => {
    if (!file) return
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      setError('Please upload an .xlsx, .xls, or .csv file.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onUpload(file)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
      setLoading(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 60px)', py: 6 }}>
      <Container maxWidth="lg">

        {/* ── Hero ── */}
        <Box sx={{ textAlign: 'center', mb: 6, animation: `${fadeUp} 0.6s ease both` }}>
          {/* Floating icon */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 88,
            height: 88,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
            border: '1px solid rgba(99,102,241,0.35)',
            mb: 3,
            animation: `${float} 3.5s ease-in-out infinite`,
            boxShadow: '0 0 40px rgba(99,102,241,0.2)',
          }}>
            <BoltOutlinedIcon sx={{ fontSize: 42, color: '#818cf8' }} />
          </Box>

          <Typography variant="h2" sx={{
            fontWeight: 900,
            letterSpacing: '-0.03em',
            mb: 1.5,
            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f0abfc 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: `${shimmer} 4s linear infinite`,
          }}>
            AI Mail Generator
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{
            fontWeight: 400,
            maxWidth: 560,
            mx: 'auto',
            lineHeight: 1.7,
            mb: 3,
          }}>
            Upload a leads spreadsheet. The AI enriches every company with live web data,
            analyses pain points, and sends a hyper-personalised email — fully automated.
          </Typography>

          {/* Pipeline breadcrumb */}
          <Stack direction="row" alignItems="center" justifyContent="center" flexWrap="wrap" gap={0.5}>
            {PIPELINE.map((step, i) => (
              <Stack key={step.label} direction="row" alignItems="center" gap={0.5}>
                <Chip
                  icon={step.icon}
                  label={step.label}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${step.color}40`,
                    color: step.color,
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    '& .MuiChip-icon': { color: step.color },
                    '&:hover': { bgcolor: `${step.color}15` },
                  }}
                />
                {i < PIPELINE.length - 1 && (
                  <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem', mx: 0.25 }}>→</Typography>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* ── Two-column layout: features + upload ── */}
        <Grid container spacing={3} alignItems="flex-start">

          {/* Left: feature cards */}
          <Grid item xs={12} md={7}>
            <Box sx={{ animation: `${fadeUp} 0.7s ease 0.1s both` }}>
              <Typography variant="overline" sx={{
                color: 'text.disabled', fontWeight: 700, letterSpacing: '0.12em', mb: 2, display: 'block',
              }}>
                What this tool does
              </Typography>
              <Grid container spacing={1.5}>
                {FEATURES.map((f, i) => (
                  <Grid item xs={12} sm={6} key={f.title}>
                    <Paper elevation={0} sx={{
                      p: 2,
                      height: '100%',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
                      transition: 'all 0.2s ease',
                      animation: `${fadeUp} 0.5s ease ${0.1 + i * 0.07}s both`,
                      '&:hover': {
                        border: `1px solid ${f.border}`,
                        bgcolor: f.bg,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${f.color}18`,
                      },
                    }}>
                      <Stack direction="row" gap={1.5} alignItems="flex-start">
                        <Box sx={{
                          width: 38, height: 38, borderRadius: '10px',
                          bgcolor: f.bg,
                          border: `1px solid ${f.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          color: f.color,
                          animation: `${pulse} ${2.5 + i * 0.3}s ease-in-out infinite`,
                        }}>
                          {f.icon}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.3, color: 'text.primary' }}>
                            {f.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            {f.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Right: upload zone */}
          <Grid item xs={12} md={5}>
            <Box sx={{ animation: `${fadeUp} 0.7s ease 0.2s both` }}>
              <Typography variant="overline" sx={{
                color: 'text.disabled', fontWeight: 700, letterSpacing: '0.12em', mb: 2, display: 'block',
              }}>
                Get started
              </Typography>

              {/* Drop zone */}
              <Paper
                elevation={0}
                onClick={() => !loading && inputRef.current?.click()}
                onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && !loading && inputRef.current?.click()}
                tabIndex={0}
                role="button"
                aria-label="Upload file"
                sx={{
                  border: `2px dashed`,
                  borderColor: dragging ? '#6366f1' : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(99,102,241,0.25)',
                  borderRadius: '16px',
                  background: dragging
                    ? 'rgba(99,102,241,0.08)'
                    : isDark
                      ? 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                      : 'rgba(248,247,255,0.8)',
                  py: 5,
                  px: 3,
                  textAlign: 'center',
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'all 0.25s ease',
                  outline: 'none',
                  boxShadow: dragging ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
                  '&:focus-visible': { boxShadow: '0 0 0 3px rgba(99,102,241,0.4)' },
                  '&:hover': !loading ? {
                    borderColor: '#6366f1',
                    background: 'rgba(99,102,241,0.05)',
                    boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
                  } : {},
                  mb: 2,
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => processFile(e.target.files?.[0])}
                />

                {loading ? (
                  <Stack alignItems="center" gap={2}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress size={52} thickness={2.5} sx={{ color: '#6366f1' }} />
                      <Box sx={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 22, color: '#818cf8' }} />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        Importing leads…
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Parsing and indexing your spreadsheet
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Stack alignItems="center" gap={2}>
                    <Box sx={{
                      width: 64, height: 64, borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                      border: '1px solid rgba(99,102,241,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: dragging
                        ? `${spin} 0.6s linear infinite`
                        : `${float} 2.8s ease-in-out infinite`,
                    }}>
                      <CloudUploadOutlinedIcon sx={{
                        fontSize: 30,
                        color: dragging ? '#818cf8' : 'primary.main',
                      }} />
                    </Box>

                    <Box>
                      <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ mb: 0.4 }}>
                        {dragging ? 'Drop to upload' : 'Drop your file here'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        or <span style={{ color: '#818cf8', fontWeight: 600 }}>click to browse</span>
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.75}>
                      {['.xlsx', '.xls', '.csv'].map(ext => (
                        <Chip
                          key={ext}
                          icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                          label={ext}
                          size="small"
                          sx={{
                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.06)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.18)'}`,
                            color: 'text.disabled',
                            fontSize: '0.68rem',
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Paper>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Column hints */}
              <Paper elevation={0} sx={{
                p: 2,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
              }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1.2 }}>
                  Recognised columns
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.6}>
                  {['Name','Company','Email','Designation','Industry','Company Size',
                    'Website','Location','Phone','LinkedIn','Revenue','Notes'].map(col => (
                    <Chip key={col} label={col} size="small" sx={{
                      fontSize: '0.65rem', fontWeight: 500,
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.05)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.12)'}`,
                      color: 'text.secondary',
                    }} />
                  ))}
                </Stack>
                <Divider sx={{ my: 1.5, opacity: 0.4 }} />
                <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.6 }}>
                  Column names are auto-detected — no fixed template needed.
                  Extra columns are preserved as raw data.
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
