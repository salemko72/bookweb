export type KnownAgency = { id: string; name: string; slug: string; logo_url: string | null }
export type PendingAgency = { name: string; logo_url: string | null; country: string; language: 'hr' | 'en'; currency: string; timezone: string }

const ACTIVE_AGENCY_KEY = 'bookweb-active-agency'
const KNOWN_AGENCIES_KEY = 'bookweb-known-agencies'
const PENDING_AGENCY_KEY = 'bookweb-pending-agency'

export function getActiveAgencyId(): string | null { return localStorage.getItem(ACTIVE_AGENCY_KEY) }
export function setActiveAgencyId(id: string): void { localStorage.setItem(ACTIVE_AGENCY_KEY, id) }
export function clearActiveAgency(): void { localStorage.removeItem(ACTIVE_AGENCY_KEY) }

export function getKnownAgencies(): KnownAgency[] {
  try { return JSON.parse(localStorage.getItem(KNOWN_AGENCIES_KEY) ?? '[]') as KnownAgency[] }
  catch { return [] }
}

export function rememberAgencies(agencies: KnownAgency[]): void {
  const byId = new Map(getKnownAgencies().map((agency) => [agency.id, agency]))
  agencies.forEach((agency) => byId.set(agency.id, agency))
  localStorage.setItem(KNOWN_AGENCIES_KEY, JSON.stringify([...byId.values()]))
}

export function getPendingAgency(): PendingAgency | null {
  try { return JSON.parse(localStorage.getItem(PENDING_AGENCY_KEY) ?? 'null') as PendingAgency | null }
  catch { return null }
}
export function setPendingAgency(agency: PendingAgency): void { localStorage.setItem(PENDING_AGENCY_KEY, JSON.stringify(agency)) }
export function clearPendingAgency(): void { localStorage.removeItem(PENDING_AGENCY_KEY) }
