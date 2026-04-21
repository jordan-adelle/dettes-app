import type { PersonWithStats } from '../types'

interface Props {
  person: PersonWithStats
  onBack: () => void
  onAdd: () => void
  onDelete: (id: string) => void
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}
function fmtDate(d: string | null) {
  if (!d) return 'Date inconnue'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export default function PersonDetail({ person, onBack, onAdd, onDelete }: Props) {
  const txns = [...person.transactions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Running balance
  let balance = 0
  const txnsWithBalance = txns.map(t => {
    balance += t.type === 'emprunt' ? +t.amount : -(+t.amount)
    return { ...t, balance }
  })

  return (
    <>
      <button className="back-btn" onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Retour
      </button>

      <div className="detail-header">
        <div className="detail-avatar" style={{ background: person.color_bg, color: person.color_text }}>
          {person.initials}
        </div>
        <div>
          <div className="detail-name">{person.name}</div>
          <div className="detail-sub">
            Reste : <strong style={{ color: person.reste > 0 ? 'var(--red)' : 'var(--green)' }}>
              {fmt(person.reste)}
            </strong>
          </div>
        </div>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <div className="ms-label">Total emprunté</div>
          <div className="ms-val red">{fmt(person.total_emprunts)}</div>
        </div>
        <div className="mini-stat">
          <div className="ms-label">Remboursé</div>
          <div className="ms-val green">{fmt(person.total_remboursements)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="section-title" style={{ margin: 0 }}>Transactions</div>
        <button onClick={onAdd} style={{
          background: 'rgba(108,99,255,.15)', border: '1px solid rgba(108,99,255,.3)',
          borderRadius: '8px', color: 'var(--accent)', padding: '6px 14px',
          fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
        }}>
          + Ajouter
        </button>
      </div>

      {txnsWithBalance.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <p>Aucune transaction</p>
        </div>
      )}

      {txnsWithBalance.map(t => (
        <div key={t.id} className="txn-item">
          <div className={`txn-dot ${t.type}`} />
          <div className="txn-body">
            <div className="txn-motif">{t.motif}</div>
            <div className="txn-date">{fmtDate(t.date)}</div>
            <span className={`txn-badge ${t.type}`}>
              {t.type === 'emprunt' ? 'Emprunt' : 'Remboursement'}
            </span>
          </div>
          <div className="txn-right">
            <div className={`txn-amount ${t.type === 'emprunt' ? 'neg' : 'pos'}`}>
              {t.type === 'emprunt' ? '+' : '-'}{fmt(+t.amount)}
            </div>
            <div className="txn-solde">Solde : {fmt(t.balance)}</div>
          </div>
          <button
            className="txn-del"
            onClick={() => { if (confirm('Supprimer ?')) onDelete(t.id) }}
            title="Supprimer"
          >✕</button>
        </div>
      ))}
    </>
  )
}
