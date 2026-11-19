export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">
        <p style={{ margin: 0 }}>
          Threads Follower Analyzer &mdash; Semua file JSON diproses secara lokal di browser Anda.
        </p>
        <p style={{ margin: 0 }}>
          Tidak ada data yang dikirim ke server mana pun.
        </p>
      </div>
    </footer>
  )
}
