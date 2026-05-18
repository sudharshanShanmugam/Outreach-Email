import { useState, useRef, DragEvent, ChangeEvent, KeyboardEvent } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import TimelineIcon from '@mui/icons-material/Timeline'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'

interface Props {
  onUpload: (file: File) => Promise<unknown>
}

const FEATURES = [
  { icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} />, label: 'AI-Powered Analysis' },
  { icon: <EmailOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Auto Email Send' },
  { icon: <TimelineIcon sx={{ fontSize: 16 }} />, label: 'Live Status Tracking' },
]

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
    <Box sx={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
    }}>
      <Container maxWidth="sm">
        {/* Hero */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.3))',
            border: '1px solid rgba(99,102,241,0.35)',
            mb: 3,
          }}>
            <EmailOutlinedIcon sx={{ fontSize: 34, color: 'primary.main' }} />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: isDark
                ? 'linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #f0abfc 100%)'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1.5,
            }}
          >
            AI Mail Generator
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.75 }}>
            Upload your leads spreadsheet. Every row becomes a card.
            <br />
            Hit <strong style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>Start</strong> — the AI analyses each lead and sends a personalised email automatically.
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
            {FEATURES.map(f => (
              <Chip
                key={f.label}
                icon={f.icon}
                label={f.label}
                size="small"
                sx={{
                  bgcolor: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  color: 'primary.light',
                  '& .MuiChip-icon': { color: 'primary.light' },
                }}
              />
            ))}
          </Stack>
        </Box>

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
            border: `2px dashed ${dragging ? 'rgba(99,102,241,0.7)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(79,70,229,0.2)'}`,
            borderRadius: '16px',
            background: dragging
              ? 'rgba(99,102,241,0.06)'
              : isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 100%)'
                : 'rgba(243,243,255,0.6)',
            py: 6,
            px: 3,
            textAlign: 'center',
            cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            '&:focus-visible': { borderColor: 'primary.main' },
            '&:hover': !loading ? {
              borderColor: isDark ? 'rgba(99,102,241,0.5)' : 'rgba(79,70,229,0.4)',
              background: 'rgba(99,102,241,0.05)',
            } : {},
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
              <CircularProgress size={40} thickness={3} sx={{ color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">Importing leads…</Typography>
            </Stack>
          ) : (
            <Stack alignItems="center" gap={1.5}>
              <Box sx={{
                width: 52, height: 52, borderRadius: '12px',
                bgcolor: 'rgba(99,102,241,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CloudUploadOutlinedIcon sx={{ fontSize: 26, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={600} color="text.primary">
                  Drop your file here
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                  or click to browse
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.75} mt={0.5}>
                {['.xlsx', '.xls', '.csv'].map(ext => (
                  <Chip
                    key={ext}
                    icon={<InsertDriveFileOutlinedIcon />}
                    label={ext}
                    size="small"
                    sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(79,70,229,0.06)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(79,70,229,0.15)'}`, color: 'text.disabled', fontSize: '0.68rem' }}
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Container>
    </Box>
  )
}
