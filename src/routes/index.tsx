import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  EyeOff,
  FileJson,
  HelpCircle,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  analyzeThreadsData,
  exportAccountsToCsv,
  formatFollowDate,
  getDemoData,
  parseMetaJson,
  type ThreadsAccount,
} from '../lib/threads-parser'

export const Route = createFileRoute('/')({
  component: ThreadsAnalyzerPage,
})

type TabKey = 'notFollowingBack' | 'mutuals' | 'fans' | 'followers' | 'following'
type SortKey = 'newest' | 'oldest' | 'az'

const STORAGE_KEY = 'threads-follower-analyzer-data'
const ITEMS_PER_PAGE = 24

function ThreadsAnalyzerPage() {
  const [followers, setFollowers] = useState<ThreadsAccount[]>([])
  const [following, setFollowing] = useState<ThreadsAccount[]>([])
  const [followersFileName, setFollowersFileName] = useState<string | null>(null)
  const [followingFileName, setFollowingFileName] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(false)

  const [saveToStorage, setSaveToStorage] = useState(false)
  const [unfollowedUsers, setUnfollowedUsers] = useState<string[]>([])

  const [activeTab, setActiveTab] = useState<TabKey>('notFollowingBack')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [hideUnfollowed, setHideUnfollowed] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null)

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.saveToStorage) {
        setSaveToStorage(true)
        if (Array.isArray(parsed.followers)) setFollowers(parsed.followers)
        if (Array.isArray(parsed.following)) setFollowing(parsed.following)
        if (typeof parsed.followersFileName === 'string') {
          setFollowersFileName(parsed.followersFileName)
        }
        if (typeof parsed.followingFileName === 'string') {
          setFollowingFileName(parsed.followingFileName)
        }
        if (Array.isArray(parsed.unfollowedUsers)) {
          setUnfollowedUsers(parsed.unfollowedUsers)
        }
      }
    } catch {
      // Ignore corrupted storage
    }
  }, [])

  // Sync to localStorage whenever saveToStorage is enabled
  useEffect(() => {
    try {
      if (saveToStorage) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            saveToStorage: true,
            followers,
            following,
            followersFileName,
            followingFileName,
            unfollowedUsers,
          }),
        )
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [
    saveToStorage,
    followers,
    following,
    followersFileName,
    followingFileName,
    unfollowedUsers,
  ])

  const handleToggleSaveToStorage = () => {
    setSaveToStorage((prev) => {
      const next = !prev
      if (!next) {
        window.localStorage.removeItem(STORAGE_KEY)
      }
      return next
    })
  }

  const handleResetLocalStorage = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setSaveToStorage(false)
    setUnfollowedUsers([])
    setFollowers([])
    setFollowing([])
    setFollowersFileName(null)
    setFollowingFileName(null)
    setSearchQuery('')
    setErrorMsg(null)
  }

  const toggleUnfollowed = (username: string) => {
    setUnfollowedUsers((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username],
    )
  }

  const handleCopyUsername = async (username: string) => {
    try {
      await navigator.clipboard.writeText(username)
      setCopiedUsername(username)
      setTimeout(() => {
        setCopiedUsername((prev) => (prev === username ? null : prev))
      }, 2000)
    } catch {
      setErrorMsg('Gagal menyalin username ke clipboard.')
    }
  }

  const followersInputRef = useRef<HTMLInputElement>(null)
  const followingInputRef = useRef<HTMLInputElement>(null)

  const hasData = followers.length > 0 || following.length > 0

  const analysis = useMemo(
    () => analyzeThreadsData(followers, following),
    [followers, following],
  )

  const handleFileUpload = async (
    file: File,
    type: 'followers' | 'following',
  ) => {
    setErrorMsg(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const parsed = parseMetaJson(json)

      if (parsed.length === 0) {
        setErrorMsg(
          `File "${file.name}" tidak memiliki data username yang dikenali. Pastikan file berasal dari export JSON Meta/Threads.`,
        )
        return
      }

      if (type === 'followers') {
        setFollowers(parsed)
        setFollowersFileName(file.name)
      } else {
        setFollowing(parsed)
        setFollowingFileName(file.name)
      }
    } catch {
      setErrorMsg(
        `Gagal membaca "${file.name}". Pastikan file berformat JSON yang valid.`,
      )
    }
  }

  const handleLoadDemo = () => {
    const demo = getDemoData()
    setFollowers(demo.followers)
    setFollowing(demo.following)
    setFollowersFileName('demo_followers.json')
    setFollowingFileName('demo_following.json')
    setErrorMsg(null)
  }

  const handleReset = () => {
    setFollowers([])
    setFollowing([])
    setFollowersFileName(null)
    setFollowingFileName(null)
    setSearchQuery('')
    setErrorMsg(null)
  }

  const activeList = useMemo(() => {
    const map: Record<TabKey, ThreadsAccount[]> = {
      notFollowingBack: analysis.notFollowingBack,
      mutuals: analysis.mutuals,
      fans: analysis.fans,
      followers: analysis.followers,
      following: analysis.following,
    }
    const base = map[activeTab]

    const filtered = base.filter((acc) => {
      if (hideUnfollowed && unfollowedUsers.includes(acc.username)) {
        return false
      }
      if (searchQuery.trim()) {
        return acc.username.includes(
          searchQuery.trim().toLowerCase().replace(/^@/, ''),
        )
      }
      return true
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'az') {
        return a.username.localeCompare(b.username)
      }
      const timeA = a.timestamp ?? 0
      const timeB = b.timestamp ?? 0
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB
    })
  }, [analysis, activeTab, searchQuery, sortBy, hideUnfollowed, unfollowedUsers])

  const totalPages = Math.max(1, Math.ceil(activeList.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedList = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return activeList.slice(start, start + ITEMS_PER_PAGE)
  }, [activeList, safePage])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, sortBy, hideUnfollowed])

  const tabs: {
    key: TabKey
    label: string
    count: number
    badgeClass: string
    icon: React.ReactNode
  }[] = [
    {
      key: 'notFollowingBack',
      label: 'Not Following Back',
      count: analysis.notFollowingBack.length,
      badgeClass: 'badge-danger',
      icon: <UserMinus className="h-4 w-4" />,
    },
    {
      key: 'mutuals',
      label: 'Mutuals',
      count: analysis.mutuals.length,
      badgeClass: 'badge-success',
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      key: 'fans',
      label: 'Fans',
      count: analysis.fans.length,
      badgeClass: 'badge-info',
      icon: <UserPlus className="h-4 w-4" />,
    },
    {
      key: 'followers',
      label: 'Followers',
      count: analysis.followers.length,
      badgeClass: 'badge-warning',
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: 'following',
      label: 'Following',
      count: analysis.following.length,
      badgeClass: 'badge-warning',
      icon: <Users className="h-4 w-4" />,
    },
  ]

  return (
    <div
      className="mx-auto max-w-6xl"
      style={{ padding: 'var(--space-6) var(--space-4)' }}
    >
      {/* Top Action Bar */}
      <div
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <div>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Cek Follower &amp; Following Threads
          </h2>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginTop: 'var(--space-1)',
            }}
          >
            Upload file <code style={{ fontFamily: 'var(--font-mono)' }}>followers.json</code> dan{' '}
            <code style={{ fontFamily: 'var(--font-mono)' }}>following.json</code> dari export data Meta Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowGuide((prev) => !prev)}
          >
            <HelpCircle className="h-4 w-4" />
            Cara Export Data
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleLoadDemo}
          >
            <Sparkles className="h-4 w-4" />
            Coba Data Demo
          </button>
          {hasData && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              title="Reset tampilan data"
            >
              <Trash2 className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Local Storage Controls */}
      <div
        className="surface-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-6)' }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <button
            type="button"
            role="switch"
            aria-checked={saveToStorage}
            data-checked={saveToStorage}
            onClick={handleToggleSaveToStorage}
            className="toggle-switch"
            aria-label="Simpan data ke Local Storage"
          >
            <span className="toggle-knob" />
          </button>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Simpan Data ke Local Storage
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Data &amp; tanda &ldquo;Sudah Unfollow&rdquo; tetap tersimpan saat halaman di-refresh.
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-secondary w-full sm:w-auto"
          onClick={handleResetLocalStorage}
        >
          <Trash2 className="h-4 w-4" />
          Reset Local Storage
        </button>
      </div>

      {/* Collapsible Export Guide */}
      {showGuide && (
        <div
          className="surface-card"
          style={{
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginTop: 0,
              marginBottom: 'var(--space-2)',
            }}
          >
            Cara Mendapatkan File JSON dari Threads / Meta
          </h3>
          <ol
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              paddingLeft: 'var(--space-5)',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
            }}
          >
            <li>Buka aplikasi <strong>Threads</strong> atau <strong>Instagram</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Accounts Center</strong>.</li>
            <li>Pilih <strong>Your information and permissions</strong> &rarr; <strong>Download your information</strong>.</li>
            <li>Pilih <strong>Download or transfer information</strong> &rarr; centang akun Threads/Instagram Anda.</li>
            <li>Pilih <strong>Some of your information</strong> &rarr; cari dan centang <strong>Followers and following</strong>.</li>
            <li>Pada pilihan format, wajib pilih <strong>JSON</strong> (bukan HTML), lalu buat permintaan export.</li>
            <li>Setelah selesai di-download dan di-extract, upload file <code style={{ fontFamily: 'var(--font-mono)' }}>followers.json</code> dan <code style={{ fontFamily: 'var(--font-mono)' }}>following.json</code> di bawah ini.</li>
          </ol>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div
          className="badge-danger"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Upload Dropzones */}
      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}
      >
        {/* Followers Upload */}
        <div
          className="dropzone"
          onClick={() => followersInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (file) handleFileUpload(file, 'followers')
          }}
        >
          <input
            ref={followersInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file, 'followers')
            }}
          />
          <div className="flex flex-col items-center" style={{ gap: 'var(--space-2)' }}>
            {followersFileName ? (
              <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--status-success)' }} />
            ) : (
              <Upload className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
            )}
            <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              {followersFileName ? followersFileName : 'Upload Followers JSON'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {followers.length > 0
                ? `${followers.length} akun followers berhasil dimuat`
                : 'Klik atau drag & drop file followers.json'}
            </div>
          </div>
        </div>

        {/* Following Upload */}
        <div
          className="dropzone"
          onClick={() => followingInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (file) handleFileUpload(file, 'following')
          }}
        >
          <input
            ref={followingInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file, 'following')
            }}
          />
          <div className="flex flex-col items-center" style={{ gap: 'var(--space-2)' }}>
            {followingFileName ? (
              <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--status-success)' }} />
            ) : (
              <FileJson className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
            )}
            <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              {followingFileName ? followingFileName : 'Upload Following JSON'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {following.length > 0
                ? `${following.length} akun following berhasil dimuat`
                : 'Klik atau drag & drop file following.json'}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hasData && (
        <div className="surface-card p-3 sm:p-5">
          {/* Tabs */}
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div className="tabs-scroll w-full sm:w-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`tab-pill ${isActive ? 'tab-pill-active' : ''}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span
                      className={`badge-status ${isActive ? '' : tab.badgeClass}`}
                      style={
                        isActive
                          ? {
                              backgroundColor: 'var(--accent-contrast)',
                              color: 'var(--accent-primary)',
                            }
                          : undefined
                      }
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              disabled={activeList.length === 0}
              onClick={() =>
                exportAccountsToCsv(activeList, `threads-${activeTab}.csv`)
              }
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <div className="relative flex-1 sm:max-w-md">
              <Search
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ left: 'var(--space-3)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Cari username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setHideUnfollowed((prev) => !prev)}
                className={hideUnfollowed ? 'btn-primary' : 'btn-secondary'}
                title="Sembunyikan akun yang sudah ditandai unfollow"
              >
                <EyeOff className="h-4 w-4" />
                <span>Sembunyikan Unfollowed</span>
              </button>

              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <ArrowUpDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                <select
                  className="input-field"
                  style={{ width: 'auto' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="az">Abjad (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account List */}
          {paginatedList.length === 0 ? (
            <div
              className="text-center"
              style={{
                padding: 'var(--space-8) var(--space-4)',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Tidak ada akun yang cocok pada kategori ini.
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                style={{ gap: 'var(--space-3)' }}
              >
                {paginatedList.map((account) => {
                const isCopied = copiedUsername === account.username
                const isUnfollowed = unfollowedUsers.includes(account.username)
                return (
                  <div
                    key={account.username}
                    className="surface-card surface-card-interactive flex items-center justify-between"
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      gap: 'var(--space-2)',
                      backgroundColor: isUnfollowed ? 'var(--status-success-soft)' : 'var(--bg-surface)',
                      borderColor: isUnfollowed ? 'var(--status-success)' : 'var(--border-strong)',
                    }}
                  >
                    <div className="flex items-center min-w-0" style={{ gap: 'var(--space-3)' }}>
                      <div
                        className="flex shrink-0 items-center justify-center uppercase"
                        style={{
                          width: '2.25rem',
                          height: '2.25rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isUnfollowed ? 'var(--status-success)' : 'var(--bg-subtle)',
                          color: isUnfollowed ? 'var(--bg-surface)' : 'var(--text-primary)',
                          border: '1px solid var(--border-strong)',
                          fontWeight: 700,
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        {account.username.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="truncate"
                          style={{
                            fontWeight: 600,
                            fontSize: 'var(--text-sm)',
                            color: isUnfollowed ? 'var(--status-success)' : 'var(--text-primary)',
                            textDecoration: isUnfollowed ? 'line-through' : 'none',
                          }}
                        >
                          @{account.username}
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: isUnfollowed ? 700 : 400,
                            color: isUnfollowed ? 'var(--status-success)' : 'var(--text-muted)',
                          }}
                        >
                          {isUnfollowed
                            ? '✓ Sudah di-unfollow'
                            : account.timestamp
                              ? `Sejak ${formatFollowDate(account.timestamp)}`
                              : 'Akun Threads'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0" style={{ gap: 'var(--space-1)' }}>
                      <button
                        type="button"
                        onClick={() => toggleUnfollowed(account.username)}
                        className="btn-secondary"
                        style={{
                          padding: 'var(--space-2)',
                          minHeight: '2.25rem',
                          backgroundColor: isUnfollowed ? 'var(--status-success)' : 'var(--bg-surface)',
                          color: isUnfollowed ? 'var(--bg-surface)' : 'var(--text-muted)',
                          borderColor: isUnfollowed ? 'var(--status-success)' : 'var(--border-strong)',
                        }}
                        title={
                          isUnfollowed
                            ? 'Batalkan tanda sudah unfollow'
                            : 'Tandai sudah di-unfollow'
                        }
                        aria-label={`Tandai ${account.username} sudah unfollow`}
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyUsername(account.username)}
                        className="btn-secondary"
                        style={{
                          padding: 'var(--space-2)',
                          minHeight: '2.25rem',
                          color: isCopied ? 'var(--status-success)' : undefined,
                          borderColor: isCopied ? 'var(--status-success)' : undefined,
                        }}
                        title={isCopied ? 'Tersalin!' : `Copy @${account.username}`}
                        aria-label={`Copy username ${account.username}`}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <a
                        href={account.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{
                          padding: 'var(--space-2)',
                          minHeight: '2.25rem',
                        }}
                        title={`Buka profil @${account.username}`}
                        aria-label={`Buka profil ${account.username}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )
              })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-between"
                  style={{
                    marginTop: 'var(--space-5)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '2px solid var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>

                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Halaman {safePage} / {totalPages} ({activeList.length} akun)
                  </span>

                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
