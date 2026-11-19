import { AtSign, ShieldCheck } from 'lucide-react'

export default function Header() {
  return (
    <header className="app-header">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between"
        style={{ padding: 'var(--space-3) var(--space-4)' }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-contrast)',
            }}
          >
            <AtSign className="h-5 w-5" />
          </div>
          <div>
            <h1
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Threads Follower Analyzer
            </h1>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                margin: 0,
              }}
            >
              Analisis Followers &amp; Following dari Export JSON Meta
            </p>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <span
            className="hidden sm:inline-flex items-center badge-status badge-success"
            title="Semua data diproses 100% di browser Anda"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            100% Client-Side
          </span>
        </div>
      </div>
    </header>
  )
}
