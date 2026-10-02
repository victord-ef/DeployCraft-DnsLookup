import { answersKey } from '../utils/dns'

export default function PropagationGrid({ data }) {
  const resolved = data.filter(d => d.ok)
  const keys = resolved.map(d => answersKey(d.answers))
  const allAgree = keys.length > 0 && keys.every(k => k === keys[0])

  return (
    <div className="card">
      <div className="card-header">
        <h2>Propagation Check</h2>
        <p>Results from Cloudflare, Google, and Quad9 resolvers.</p>
      </div>

      <div className="prop-grid">
        {data.map(({ resolver, ok, answers, error }) => (
          <div key={resolver.name} className="resolver-card">
            <div className="resolver-header">
              <span className={`status-dot ${ok ? 'dot-ok' : 'dot-err'}`} />
              <div>
                <span className="resolver-name">{resolver.name}</span>
                <span className="resolver-ip">{resolver.ip}</span>
              </div>
            </div>
            {ok ? (
              answers.length > 0 ? (
                <ul className="answer-list">
                  {answers.map((a, i) => <li key={i}>{a.data}</li>)}
                </ul>
              ) : (
                <p className="resolver-note">No records</p>
              )
            ) : (
              <p className="resolver-err-text">{error ?? 'Request failed'}</p>
            )}
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <div className={`prop-summary ${allAgree ? 'prop-ok' : 'prop-warn'}`}>
          {allAgree
            ? '✓ All resolvers agree — record is globally propagated'
            : '⚠ Resolvers return different values — propagation may be in progress'}
        </div>
      )}
    </div>
  )
}
