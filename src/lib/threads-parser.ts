export interface ThreadsAccount {
  username: string
  href: string
  timestamp?: number
}

export interface ThreadsAnalysis {
  followers: ThreadsAccount[]
  following: ThreadsAccount[]
  mutuals: ThreadsAccount[]
  notFollowingBack: ThreadsAccount[]
  fans: ThreadsAccount[]
}

/**
 * Normalizes a username by trimming whitespace and removing leading '@'.
 */
function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@/, '').toLowerCase()
}

/**
 * Extracts ThreadsAccount items from various Meta / Instagram / Threads JSON export formats.
 */
export function parseMetaJson(rawJson: unknown): ThreadsAccount[] {
  const accountsMap = new Map<string, ThreadsAccount>()

  const addAccount = (username: string, href?: string, timestamp?: number) => {
    const clean = normalizeUsername(username)
    if (!clean) return
    if (!accountsMap.has(clean)) {
      accountsMap.set(clean, {
        username: clean,
        href: href || `https://www.threads.net/@${clean}`,
        timestamp,
      })
    }
  }

  const processArray = (items: unknown[]) => {
    for (const item of items) {
      if (typeof item === 'string') {
        addAccount(item)
        continue
      }
      if (!item || typeof item !== 'object') continue

      const record = item as Record<string, unknown>

      // Standard Meta export: { string_list_data: [{ href, value, timestamp }] }
      if (Array.isArray(record.string_list_data)) {
        for (const entry of record.string_list_data) {
          if (entry && typeof entry === 'object') {
            const e = entry as Record<string, unknown>
            const value = typeof e.value === 'string' ? e.value : ''
            const href = typeof e.href === 'string' ? e.href : undefined
            const timestamp = typeof e.timestamp === 'number' ? e.timestamp : undefined
            if (value) {
              addAccount(value, href, timestamp)
            }
          }
        }
        continue
      }

      // Alternative simple object: { username: "...", href?: "...", timestamp?: 123 }
      if (typeof record.username === 'string') {
        addAccount(
          record.username,
          typeof record.href === 'string' ? record.href : undefined,
          typeof record.timestamp === 'number' ? record.timestamp : undefined,
        )
        continue
      }

      // Alternative title field
      if (typeof record.title === 'string' && record.title.trim()) {
        addAccount(record.title)
      }
    }
  }

  if (Array.isArray(rawJson)) {
    processArray(rawJson)
  } else if (rawJson && typeof rawJson === 'object') {
    const obj = rawJson as Record<string, unknown>
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        processArray(value)
      }
    }
  }

  return Array.from(accountsMap.values())
}

/**
 * Compares followers and following lists to produce mutuals, notFollowingBack, and fans.
 */
export function analyzeThreadsData(
  followers: ThreadsAccount[],
  following: ThreadsAccount[],
): ThreadsAnalysis {
  const followerSet = new Set(followers.map((f) => f.username))
  const followingSet = new Set(following.map((f) => f.username))

  const mutuals = following.filter((f) => followerSet.has(f.username))
  const notFollowingBack = following.filter((f) => !followerSet.has(f.username))
  const fans = followers.filter((f) => !followingSet.has(f.username))

  return {
    followers,
    following,
    mutuals,
    notFollowingBack,
    fans,
  }
}

/**
 * Formats a Unix timestamp (seconds) into a readable Indonesian date string.
 */
export function formatFollowDate(timestamp?: number): string {
  if (!timestamp) return '-'
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ms))
}

/**
 * Exports an array of ThreadsAccount to a downloadable CSV file.
 */
export function exportAccountsToCsv(accounts: ThreadsAccount[], filename: string) {
  const header = 'Username,Profile URL,Timestamp\n'
  const rows = accounts
    .map((acc) => {
      const date = acc.timestamp ? formatFollowDate(acc.timestamp) : ''
      return `@${acc.username},${acc.href},"${date}"`
    })
    .join('\n')

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Generates realistic demo data so users can preview the app immediately.
 */
export function getDemoData(): {
  followers: ThreadsAccount[]
  following: ThreadsAccount[]
} {
  const now = Math.floor(Date.now() / 1000)
  const day = 86400

  const followers: ThreadsAccount[] = [
    { username: 'andi_dev', href: 'https://www.threads.net/@andi_dev', timestamp: now - 2 * day },
    { username: 'siti.design', href: 'https://www.threads.net/@siti.design', timestamp: now - 5 * day },
    { username: 'budi_tech', href: 'https://www.threads.net/@budi_tech', timestamp: now - 12 * day },
    { username: 'rina.writes', href: 'https://www.threads.net/@rina.writes', timestamp: now - 20 * day },
    { username: 'doni_photo', href: 'https://www.threads.net/@doni_photo', timestamp: now - 35 * day },
    { username: 'maya_uiux', href: 'https://www.threads.net/@maya_uiux', timestamp: now - 40 * day },
  ]

  const following: ThreadsAccount[] = [
    { username: 'andi_dev', href: 'https://www.threads.net/@andi_dev', timestamp: now - 3 * day },
    { username: 'siti.design', href: 'https://www.threads.net/@siti.design', timestamp: now - 6 * day },
    { username: 'budi_tech', href: 'https://www.threads.net/@budi_tech', timestamp: now - 15 * day },
    { username: 'zuck', href: 'https://www.threads.net/@zuck', timestamp: now - 30 * day },
    { username: 'mosseri', href: 'https://www.threads.net/@mosseri', timestamp: now - 45 * day },
    { username: 'threads', href: 'https://www.threads.net/@threads', timestamp: now - 60 * day },
    { username: 'tech_insider', href: 'https://www.threads.net/@tech_insider', timestamp: now - 70 * day },
  ]

  return { followers, following }
}

