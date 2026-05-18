export type RoleTier =
  | 'c_suite'
  | 'vp_dir'
  | 'manager'
  | 'technical'
  | 'hr'
  | 'marketing'
  | 'sales'
  | 'professional'

export type CardStatus = 'pending' | 'processing' | 'done' | 'error'

export interface Lead {
  id: string
  name?: string
  company?: string
  email?: string
  designation?: string
  title?: string
  industry?: string
  company_size?: string
  website?: string
  location?: string
  existing_services?: string
  role_tier?: RoleTier
}

export interface CardState {
  status: CardStatus
  sent: boolean
  error: string | null
}

export type CardStates = Record<string, CardState>

export interface SmtpStatus {
  configured: boolean
  user: string
  host: string
  port: number
  from_name: string
}

export interface SmtpSavePayload {
  user: string
  password: string
  host: string
  port: number
  from_name: string
}
