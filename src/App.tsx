import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, supabaseConfigError } from './lib/supabase'
import type { Person, Transaction, PersonWithStats, View } from './types'
import Dashboard from './components/Dashboard'
import PersonDetail from './components/PersonDetail'
import AddForm from './components/AddForm'

// ── icons ──────────────────────────────────────────────────
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>
  </svg>
)

// ── helpers ────────────────────────────────────────────────
function buildStats(persons: Person[], transactions: Transaction[]): PersonWithStats[] {
  return persons.map(p => {
    const txns = transactions.filter(t => t.person_id === p.id)
    const total_emprunts = txns.filter(t => t.type === 'emprunt').reduce((s, t) => s + +t.amount, 0)
    const total_remboursements = txns.filter(t => t.type === 'remboursement').reduce((s, t) => s + +t.amount, 0)
    return { ...p, transactions: txns, total_emprunts, total_remboursements, reste: total_emprunts - total_remboursements }
  })
}

export default function App() {
  const [persons, setPersons]           = useState<Person[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [view, setView]                 = useState<View>({ name: 'dashboard' })
  const [toast, setToast]               = useState({ msg: '', show: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  // ── data fetching ─────────────────────────────────────────
  const load = useCallback(async () => {
    if (!supabase) {
      setError(supabaseConfigError ?? 'Configuration Supabase manquante')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [{ data: ps, error: pe }, { data: ts, error: te }] = await Promise.all([
        supabase.from('persons').select('*').order('name'),
        supabase.from('transactions').select('*').order('created_at', { ascending: true }),
      ])
      if (pe) throw pe
      if (te) throw te
      setPersons(ps ?? [])
      setTransactions(ts ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── real-time subscription ────────────────────────────────
  useEffect(() => {
    const client = supabase
    if (!client) return

    const sub = client
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => { load() })
      .subscribe()
    return () => { client.removeChannel(sub) }
  }, [load])

  // ── toast helper ──────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current)
    setToast({ msg, show: true })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2500)
  }, [])

  // ── actions ───────────────────────────────────────────────
  const addTransaction = async (data: {
    person_id: string; type: 'emprunt' | 'remboursement'; amount: number; motif: string; date: string | null
  }) => {
    if (!supabase) { setError(supabaseConfigError ?? 'Configuration Supabase manquante'); return false }
    const { error: e } = await supabase.from('transactions').insert(data)
    if (e) { showToast('Erreur : ' + e.message); return false }
    await load()
    showToast('Transaction ajoutée ✓')
    return true
  }

  const deleteTransaction = async (id: string) => {
    if (!supabase) { setError(supabaseConfigError ?? 'Configuration Supabase manquante'); return }
    const { error: e } = await supabase.from('transactions').delete().eq('id', id)
    if (e) { showToast('Erreur : ' + e.message); return }
    await load()
    showToast('Transaction supprimée')
  }

  const addPerson = async (name: string, color_bg: string, color_text: string, initials: string) => {
    if (!supabase) { setError(supabaseConfigError ?? 'Configuration Supabase manquante'); return false }
    const { error: e } = await supabase.from('persons').insert({ name, color_bg, color_text, initials })
    if (e) { showToast('Erreur : ' + e.message); return false }
    await load()
    showToast(`${name} ajouté(e) ✓`)
    return true
  }

  // ── nav ───────────────────────────────────────────────────
  const goTo = (v: View) => { setView(v); window.scrollTo(0, 0) }
  const currentNav = view.name === 'detail' ? 'dashboard' : view.name

  // ── derived data ──────────────────────────────────────────
  const stats = buildStats(persons, transactions)

  return (
    <>
      {/* HEADER */}
      <header>
        <div>
          <div className="logo">mes<span>dettes</span></div>
          <div className="header-date">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main>
        {loading && <div className="spinner" />}
        {error   && <div className="error-box">⚠️ {error} — <button onClick={load} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',textDecoration:'underline'}}>Réessayer</button></div>}

        {!loading && !error && (
          <>
            {view.name === 'dashboard' && (
              <Dashboard
                stats={stats}
                onPersonClick={p => goTo({ name: 'detail', personId: p.id })}
              />
            )}
            {view.name === 'detail' && (
              <PersonDetail
                person={stats.find(s => s.id === view.personId)!}
                onBack={() => goTo({ name: 'dashboard' })}
                onAdd={() => goTo({ name: 'add', personId: view.personId })}
                onDelete={deleteTransaction}
              />
            )}
            {view.name === 'add' && (
              <AddForm
                persons={persons}
                defaultPersonId={view.personId}
                onSubmit={addTransaction}
                onAddPerson={addPerson}
                onBack={() => goTo({ name: 'dashboard' })}
              />
            )}
          </>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav>
        <button className={currentNav === 'dashboard' ? 'active' : ''} onClick={() => goTo({ name: 'dashboard' })}>
          <GridIcon /> Vue d'ensemble
        </button>
        <button className={currentNav === 'add' ? 'active' : ''} onClick={() => goTo({ name: 'add' })}>
          <PlusIcon /> Ajouter
        </button>
      </nav>

      {/* TOAST */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </>
  )
}
