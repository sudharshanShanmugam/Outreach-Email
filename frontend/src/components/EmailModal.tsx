import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { Lead } from '../types'

interface Props {
  leadId: string
  lead?: Lead
  onClose: () => void
}

function parseEmail(raw: string): { subject: string; body: string } {
  const lines = raw.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().toLowerCase().startsWith('subject:')) {
      return {
        subject: lines[i].substring(lines[i].indexOf(':') + 1).trim(),
        body: lines.slice(i + 1).join('\n').trim(),
      }
    }
  }
  return { subject: '', body: raw.trim() }
}

export default function EmailModal({ leadId, lead, onClose }: Props) {
  const [loading,  setLoading]  = useState(true)
  const [content,  setContent]  = useState<string | null>(null)
  const [fetchErr, setFetchErr] = useState<string | null>(null)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    setLoading(true)
    setFetchErr(null)
    fetch(`/api/email/${leadId}`)
      .then(r => { if (!r.ok) throw new Error('Email not available yet'); return r.json() })
      .then((d: { email: string }) => setContent(d.email))
      .catch((e: Error) => setFetchErr(e.message))
      .finally(() => setLoading(false))
  }, [leadId])

  const { subject, body } = content ? parseEmail(content) : { subject: '', body: '' }

  const handleCopy = async () => {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleDownload = () => {
    if (!content) return
    const blob = new Blob([content], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${lead?.company ?? 'email'}_outreach.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const recipientLabel = [lead?.name, lead?.company].filter(Boolean).join(' · ')

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth
      TransitionProps={{ style: { transform: 'none' } }}>
      {/* ── Title ── */}
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1.2}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              bgcolor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <EmailOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Email Content</Typography>
              {recipientLabel && (
                <Typography variant="caption" color="text.secondary">{recipientLabel}</Typography>
              )}
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small"
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.06)' } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress size={32} thickness={3} sx={{ color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Loading email…</Typography>
          </Stack>
        )}

        {fetchErr && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{fetchErr}</Alert>
          </Box>
        )}

        {content && !loading && (
          <Box>
            {/* Recipient + subject */}
            <Box sx={{ px: 3, py: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
              {lead?.email && (
                <Stack direction="row" alignItems="center" gap={1} mb={1}>
                  <Typography variant="caption" color="text.disabled" sx={{ minWidth: 44, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</Typography>
                  <Chip
                    label={lead.email}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'text.secondary', fontSize: '0.73rem' }}
                  />
                </Stack>
              )}
              {subject && (
                <Stack direction="row" alignItems="flex-start" gap={1}>
                  <Typography variant="caption" color="text.disabled" sx={{ minWidth: 44, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', pt: 0.1 }}>Subject</Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.4 }}>{subject}</Typography>
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Email body */}
            <Box sx={{
              px: 3,
              py: 2.5,
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.875rem',
              lineHeight: 1.9,
              color: 'text.primary',
              whiteSpace: 'pre-wrap',
              maxHeight: '52vh',
              overflowY: 'auto',
            }}>
              {body || content}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* ── Actions ── */}
      {content && !loading && (
        <DialogActions>
          <Button variant="text" size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            Close
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <Button
              variant="outlined"
              size="small"
              startIcon={copied ? <CheckRoundedIcon sx={{ color: 'success.main' }} /> : <ContentCopyRoundedIcon />}
              onClick={handleCopy}
              sx={copied ? { borderColor: 'rgba(16,185,129,0.4)', color: 'success.main' } : {}}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadOutlinedIcon />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
