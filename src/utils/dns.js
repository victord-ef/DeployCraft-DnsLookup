export const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS']

export const RESOLVERS = [
  { name: 'Cloudflare', ip: '1.1.1.1',  url: 'https://cloudflare-dns.com/dns-query' },
  { name: 'Google',     ip: '8.8.8.8',  url: 'https://dns.google/resolve' },
  { name: 'Quad9',      ip: '9.9.9.9',  url: 'https://dns.quad9.net/dns-query' },
]

export const RCODE = {
  0: 'NOERROR', 1: 'FORMERR', 2: 'SERVFAIL',
  3: 'NXDOMAIN', 4: 'NOTIMP', 5: 'REFUSED',
}

export const TYPE_NAME = {
  1: 'A', 2: 'NS', 5: 'CNAME', 15: 'MX', 16: 'TXT', 28: 'AAAA',
}

function normalizeRecord(r) {
  let data = r.data ?? ''
  if (typeof data === 'string') {
    data = data.replace(/^"(.*)"$/, '$1').replace(/\.$/, '')
  }
  return { ...r, data }
}

async function doHQuery(resolverUrl, name, type) {
  const res = await fetch(
    `${resolverUrl}?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(6000) }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function lookupDns(domain, type) {
  const name = domain.trim().replace(/\.$/, '')
  const data = await doHQuery('https://cloudflare-dns.com/dns-query', name, type)
  return {
    status: data.Status ?? 0,
    answers: (data.Answer ?? []).map(normalizeRecord),
  }
}

export async function checkPropagation(domain, type) {
  const name = domain.trim().replace(/\.$/, '')
  const settled = await Promise.allSettled(
    RESOLVERS.map(r => doHQuery(r.url, name, type))
  )
  return RESOLVERS.map((resolver, i) => {
    const r = settled[i]
    if (r.status === 'fulfilled') {
      return {
        resolver,
        ok: r.value.Status === 0,
        answers: (r.value.Answer ?? []).map(normalizeRecord),
        error: null,
      }
    }
    return { resolver, ok: false, answers: [], error: r.reason?.message ?? 'Failed' }
  })
}

export function parseMx(data) {
  const m = data.match(/^(\d+)\s+(.+)$/)
  return m ? { priority: parseInt(m[1]), exchange: m[2] } : { priority: null, exchange: data }
}

export function answersKey(answers) {
  return answers.map(a => a.data).sort().join('|')
}
