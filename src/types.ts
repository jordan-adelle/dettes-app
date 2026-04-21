export interface Person {
  id: string
  name: string
  color_bg: string
  color_text: string
  initials: string
  created_at: string
}

export interface Transaction {
  id: string
  person_id: string
  type: 'emprunt' | 'remboursement'
  amount: number
  motif: string
  date: string | null
  created_at: string
}

export interface PersonWithStats extends Person {
  transactions: Transaction[]
  total_emprunts: number
  total_remboursements: number
  reste: number
}

export type View =
  | { name: 'dashboard' }
  | { name: 'detail'; personId: string }
  | { name: 'add'; personId?: string }
