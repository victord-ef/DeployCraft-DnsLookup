import { useState } from 'react'
import DnsInput from './components/DnsInput'
import DnsResults from './components/DnsResults'
import PropagationGrid from './components/PropagationGrid'
import { lookupDns, checkPropagation } from './utils/dns'

export default function App() {
  const [domain, setDomain] = useState('')
  const [type, setType] = useState('A')
  const [results, setResults] = useState(null)
  const [propagation, setPropagation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLookup(d, t) {
    setDomain(d)
    setType(t)
    setLoading(true)
    setError(null)
    setResults(null)
    setPropagation(null)
    try {
      const [main, prop] = await Promise.all([
        lookupDns(d, t),
        checkPropagation(d, t),
      ])
      setResults(main)
      setPropagation(prop)
    } catch (e) {
      setError(e.message ?? 'DNS query failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="breadcrumb">
          <a href="https://deploycraft.io" className="brand">DeployCraft.io</a>
          <span className="sep">/</span>
          <span className="crumb">DNS Lookup</span>
        </div>
        <a href="https://deploycraft.io/tools/networking/" className="header-link">
          🌐 Networking Tools
        </a>
      </header>

      <main className="app-main">
        <div className="page-hero">
          <h1>DNS Lookup</h1>
          <p>Query A, MX, TXT, CNAME, AAAA, and NS records with propagation status across resolvers.</p>
        </div>

        <DnsInput onLookup={handleLookup} loading={loading} />

        {loading && (
          <div className="loading-box">
            <span className="spinner" />
            Querying DNS resolvers…
          </div>
        )}

        {error && <div className="error-box">⚠ {error}</div>}

        {results && !loading && (
          <DnsResults results={results} domain={domain} type={type} />
        )}

        {propagation && !loading && (
          <PropagationGrid data={propagation} />
        )}
      </main>
    </div>
  )
}
