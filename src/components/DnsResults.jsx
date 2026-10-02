import { RCODE, TYPE_NAME, parseMx } from '../utils/dns'

function RecordValue({ typeNum, data }) {
  const typeName = TYPE_NAME[typeNum] ?? String(typeNum)
  if (typeName === 'MX') {
    const { priority, exchange } = parseMx(data)
    return (
      <span>
        {priority !== null && <span className="mx-priority">{priority}</span>}
        {exchange}
      </span>
    )
  }
  if (typeName === 'TXT') return <span className="txt-value">{data}</span>
  return <span>{data}</span>
}

export default function DnsResults({ results, domain, type }) {
  const rcode = RCODE[results.status] ?? `RCODE ${results.status}`
  const isOk = results.status === 0

  return (
    <div className="card">
      <div className="card-header results-header">
        <div>
          <h2>DNS Records</h2>
          <div className="results-meta">
            <span className="type-badge">{type}</span>
            <span className="domain-mono">{domain}</span>
          </div>
        </div>
        <span className={`rcode-badge ${isOk ? 'rcode-ok' : 'rcode-err'}`}>{rcode}</span>
      </div>

      {results.status === 3 ? (
        <div className="empty-state">
          <span className="empty-icon">✕</span>
          <div>
            <strong>Domain not found</strong>
            <p>NXDOMAIN — "{domain}" does not exist in DNS.</p>
          </div>
        </div>
      ) : results.answers.length === 0 ? (
        <div className="empty-state">
          <p>No {type} records found for {domain}.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dns-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>TTL</th>
                <th>TYPE</th>
                <th>VALUE</th>
              </tr>
            </thead>
            <tbody>
              {results.answers.map((ans, i) => (
                <tr key={i}>
                  <td className="td-mono td-muted">{ans.name.replace(/\.$/, '')}</td>
                  <td className="td-muted td-nowrap">{ans.TTL}s</td>
                  <td><span className="type-pill">{TYPE_NAME[ans.type] ?? ans.type}</span></td>
                  <td className="td-mono td-value">
                    <RecordValue typeNum={ans.type} data={ans.data} />
                    <button
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(ans.data)}
                    >copy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
