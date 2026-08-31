export default function AppNav({ current }: { current: 'dashboard' | 'incomplete' }) {
  return <nav className="app-nav" aria-label="Owner prospecting navigation">
    <a className={current==='dashboard'?'active':''} href="/">Dashboard</a>
    <a className={current==='incomplete'?'active':''} href="/incomplete-leads">Incomplete Leads</a>
  </nav>;
}
