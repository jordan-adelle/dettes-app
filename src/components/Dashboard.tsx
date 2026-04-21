import type { PersonWithStats } from '../types'

interface Props {
  stats: PersonWithStats[]
  onPersonClick: (p: PersonWithStats) => void
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

export default function Dashboard({ stats, onPersonClick }: Props) {
  const totalEmprunts       = stats.reduce((s, p) => s + p.total_emprunts, 0)
  const totalRemboursements = stats.reduce((s, p) => s + p.total_remboursements, 0)
  const totalReste          = stats.reduce((s, p) => s + p.reste, 0)
  const pct = totalEmprunts > 0 ? (totalRemboursements / totalEmprunts) * 100 : 0

  return (
    <>
      {/* Big total card */}
      <div className="total-card">
        <div className="tc-label">Total restant dû</div>
        <div className="tc-amount">{fmt(totalReste)}</div>
        <div className="tc-sub">{fmt(totalRemboursements)} remboursés sur {fmt(totalEmprunts)}</div>
        <div className="progress-wrap">
          <div className="progress-labels">
            <span>Remboursé</span>
            <span>{pct.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="section-title">Personnes</div>

      {stats.length === 0 && (
        <div className="empty">
          <div className="empty-icon">👥</div>
          <p>Aucune personne enregistrée</p>
        </div>
      )}

      {stats.map(p => (
        <div key={p.id} className="person-card" onClick={() => onPersonClick(p)}>
          <div className="avatar" style={{ background: p.color_bg, color: p.color_text }}>
            {p.initials}
          </div>
          <div className="person-info">
            <div className="person-name">{p.name}</div>
            <div className="person-meta">
              {p.transactions.length} transaction{p.transactions.length !== 1 ? 's' : ''}
              {p.total_remboursements > 0 && ` · ${fmt(p.total_remboursements)} remboursés`}
            </div>
          </div>
          <div className="person-right">
            <div className={`person-amount ${p.reste <= 0 ? 'paid' : ''}`}>{fmt(p.reste)}</div>
            <div className="chevron">›</div>
          </div>
        </div>
      ))}
    </>
  )
}
