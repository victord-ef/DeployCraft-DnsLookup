import { useState } from 'react'
import { RECORD_TYPES } from '../utils/dns'

const EXAMPLES = ['google.com', 'cloudflare.com', 'github.com', 'amazon.com']

export default function DnsInput({ onLookup, loading }) {
  const [domain, setDomain] = useState('google.com')
  const [type, setType] = useState('A')

  function submit(d, t) {
    const trimmed = d.trim()
    if (trimmed) onLookup(trimmed, t)
  }

  function handleSubmit(e) {
    e.preventDefault()
    submit(domain, type)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>DNS Query</h2>
        <p>Enter a domain and select a record type.</p>
      </div>
      <form onSubmit={handleSubmit} className="dns-form">
        <div className="input-row">
          <input
            className="input-field"
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="example.com"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          <select
            className="type-select"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn-lookup" type="submit" disabled={loading || !domain.trim()}>
            {loading ? 'Looking up…' : 'Lookup →'}
          </button>
        </div>
        <div className="examples-row">
          <span className="examples-label">EXAMPLES:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              type="button"
              className="example-chip"
              onClick={() => { setDomain(ex); submit(ex, type) }}
            >
              {ex}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}
