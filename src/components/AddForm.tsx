import { useState } from 'react'
import type { Person } from '../types'

interface Props {
  persons: Person[]
  defaultPersonId?: string
  onSubmit: (data: {
    person_id: string
    type: 'emprunt' | 'remboursement'
    amount: number
    motif: string
    date: string | null
  }) => Promise<boolean>
  onAddPerson: (name: string, color_bg: string, color_text: string, initials: string) => Promise<boolean>
}

const PRESET_COLORS = [
  { bg: '#2a1f6b', text: '#a09bff' },
  { bg: '#1f3a2a', text: '#00e5a0' },
  { bg: '#3a1f2a', text: '#ff6b9d' },
  { bg: '#3a2a1f', text: '#ffaa5c' },
  { bg: '#1f2a3a', text: '#5cb8ff' },
  { bg: '#2a1f3a', text: '#d09bff' },
]

export default function AddForm({ persons, defaultPersonId, onSubmit, onAddPerson }: Props) {
  const [personId, setPersonId]   = useState(defaultPersonId ?? persons[0]?.id ?? '')
  const [type, setType]           = useState<'emprunt' | 'remboursement'>('emprunt')
  const [amount, setAmount]       = useState('')
  const [motif, setMotif]         = useState('')
  const [date, setDate]           = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading]     = useState(false)

  // New person panel
  const [showNewPerson, setShowNewPerson] = useState(false)
  const [newName, setNewName]     = useState('')
  const [colorIdx, setColorIdx]   = useState(0)
  const [addingPerson, setAddingPerson] = useState(false)

  const handleSubmit = async () => {
    if (!personId || !amount || !motif.trim()) return
    const n = parseFloat(amount)
    if (isNaN(n) || n <= 0) return
    setLoading(true)
    const ok = await onSubmit({ person_id: personId, type, amount: n, motif: motif.trim(), date: date || null })
    setLoading(false)
    if (ok) {
      setAmount('')
      setMotif('')
    }
  }

  const handleAddPerson = async () => {
    if (!newName.trim()) return
    setAddingPerson(true)
    const col = PRESET_COLORS[colorIdx]
    const initials = newName.trim().slice(0, 2).toUpperCase()
    const ok = await onAddPerson(newName.trim(), col.bg, col.text, initials)
    setAddingPerson(false)
    if (ok) {
      setNewName('')
      setShowNewPerson(false)
    }
  }

  return (
    <>
      <div className="form-title">Nouvelle<br/>transaction</div>

      {/* Person */}
      <div className="form-group">
        <label className="form-label">Personne</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="form-select" value={personId} onChange={e => setPersonId(e.target.value)} style={{ flex: 1 }}>
            {persons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            onClick={() => setShowNewPerson(!showNewPerson)}
            style={{
              background: showNewPerson ? 'rgba(108,99,255,.15)' : 'var(--card)',
              border: '1px solid ' + (showNewPerson ? 'rgba(108,99,255,.4)' : 'var(--border)'),
              borderRadius: 'var(--r-sm)', color: 'var(--accent)',
              padding: '0 14px', cursor: 'pointer', fontSize: '20px', fontWeight: '300'
            }}
          >+</button>
        </div>

        {showNewPerson && (
          <div style={{ marginTop: '10px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '14px' }}>
            <div className="form-label" style={{ marginBottom: '8px' }}>Nom</div>
            <input
              className="form-input" placeholder="Prénom..." value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <div className="form-label" style={{ marginBottom: '8px' }}>Couleur</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {PRESET_COLORS.map((c, i) => (
                <div key={i} onClick={() => setColorIdx(i)} style={{
                  width: '28px', height: '28px', borderRadius: '8px', background: c.bg,
                  border: colorIdx === i ? `2px solid ${c.text}` : '2px solid transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: c.text, fontSize: '10px', fontWeight: '800', fontFamily: 'Syne, sans-serif'
                }}>
                  {newName.slice(0, 2).toUpperCase() || '?'}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddPerson} disabled={!newName.trim() || addingPerson}
              className="submit-btn" style={{ padding: '10px', fontSize: '14px' }}
            >
              {addingPerson ? 'Ajout...' : 'Ajouter la personne'}
            </button>
          </div>
        )}
      </div>

      {/* Type */}
      <div className="form-group">
        <label className="form-label">Type</label>
        <div className="type-toggle">
          <button className={`type-btn ${type === 'emprunt' ? 'sel-emprunt' : ''}`} onClick={() => setType('emprunt')}>
            💸 Emprunt
          </button>
          <button className={`type-btn ${type === 'remboursement' ? 'sel-remboursement' : ''}`} onClick={() => setType('remboursement')}>
            ✅ Remboursement
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="form-group">
        <label className="form-label">Montant</label>
        <div className="amount-wrap">
          <span className="amount-prefix">€</span>
          <input
            type="number" className="form-input" placeholder="0.00"
            step="0.01" min="0" value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Motif */}
      <div className="form-group">
        <label className="form-label">Motif / Raison</label>
        <input
          type="text" className="form-input" placeholder="ex : Prêt pour voiture..."
          value={motif} onChange={e => setMotif(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      {/* Date */}
      <div className="form-group">
        <label className="form-label">Date</label>
        <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={loading || !personId || !amount || !motif.trim()}
      >
        {loading ? 'Enregistrement...' : 'Ajouter la transaction'}
      </button>
    </>
  )
}
