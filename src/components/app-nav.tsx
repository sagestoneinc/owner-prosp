export default function AppNav({ current }: { current: 'dashboard' | 'county' | 'incomplete' }) {
  return <nav className="app-nav" aria-label="Owner prospecting navigation">
    <a className={current==='dashboard'?'active':''} href="/">Dashboard</a>
    <a className={current==='county'?'active':''} href="/leads-by-county">Leads by County</a>
    <a className={current==='incomplete'?'active':''} href="/incomplete-leads">Incomplete Leads</a>
  </nav>;
}
