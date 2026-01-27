export interface DSpaceHALResponse<T> {
  _embedded?: T
  _links: {
    self: { href: string }
    [key: string]: { href: string } | undefined
  }
  page?: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

export interface DSpaceEPerson {
  id: string
  uuid: string
  name: string
  email: string
  metadata: {
    "eperson.firstname"?: MetadataValue[]
    "eperson.lastname"?: MetadataValue[]
  }
  canLogIn: boolean
  requireCertificate: boolean
  selfRegistered: boolean
  _links: {
    self: { href: string }
    groups?: { href: string }
  }
}

export interface DSpaceGroup {
  id: string
  uuid: string
  name: string
  permanent: boolean
  _links: {
    self: { href: string }
  }
}

export interface MetadataValue {
  value: string
  language?: string | null
  authority?: string | null
  confidence?: number
  place?: number
}

export interface DSpaceCommunity {
  id: string
  uuid: string
  name: string
  handle: string
  metadata: {
    "dc.title": MetadataValue[]
    "dc.description"?: MetadataValue[]
    "dc.description.abstract"?: MetadataValue[]
  }
  _links: {
    self: { href: string }
    collections?: { href: string }
    subcommunities?: { href: string }
    logo?: { href: string }
  }
}

export interface DSpaceCollection {
  id: string
  uuid: string
  name: string
  handle: string
  metadata: {
    "dc.title": MetadataValue[]
    "dc.description"?: MetadataValue[]
    "dc.description.abstract"?: MetadataValue[]
  }
  _links: {
    self: { href: string }
    community?: { href: string }
    logo?: { href: string }
    workspaceitems?: { href: string }
  }
}

export interface DSpaceItem {
  id: string
  uuid: string
  name: string
  handle: string
  inArchive: boolean
  discoverable: boolean
  withdrawn: boolean
  lastModified: string
  metadata: {
    "dc.title": MetadataValue[]
    "dc.contributor.author"?: MetadataValue[]
    "dc.date.issued"?: MetadataValue[]
    "dc.description.abstract"?: MetadataValue[]
    "dc.subject"?: MetadataValue[]
    "dc.type"?: MetadataValue[]
    "dc.identifier.uri"?: MetadataValue[]
  }
  _links: {
    self: { href: string }
    bundles?: { href: string }
    owningCollection?: { href: string }
    relationships?: { href: string }
    thumbnail?: { href: string }
  }
}

export interface DSpaceBundle {
  id: string
  uuid: string
  name: string
  metadata: Record<string, MetadataValue[]>
  _links: {
    self: { href: string }
    bitstreams?: { href: string }
    item?: { href: string }
  }
}

export interface DSpaceBitstream {
  id: string
  uuid: string
  name: string
  bundleName: string
  sizeBytes: number
  checkSum: {
    checkSumAlgorithm: string
    value: string
  }
  sequenceId: number
  _links: {
    self: { href: string }
    content?: { href: string }
    format?: { href: string }
  }
}

export interface DSpaceWorkspaceItem {
  id: number
  lastModified: string
  sections: {
    [key: string]: unknown
  }
  _embedded?: {
    item?: DSpaceItem
    collection?: DSpaceCollection
  }
  _links: {
    self: { href: string }
    item?: { href: string }
    collection?: { href: string }
  }
}

export interface DSpaceSearchResult {
  _embedded?: {
    searchResult?: {
      _embedded?: {
        objects?: Array<{
          _embedded?: {
            indexableObject: DSpaceItem | DSpaceCommunity | DSpaceCollection
          }
          hitHighlights?: unknown
        }>
      }
      page?: {
        size: number
        totalElements: number
        totalPages: number
        number: number
      }
    }
  }
}

export interface DSpaceAuthStatus {
  okay: boolean
  authenticated: boolean
  authenticationMethod?: string
  type?: string
  _embedded?: {
    eperson?: DSpaceEPerson
  }
  _links: {
    self: { href: string }
    eperson?: { href: string }
  }
}

// App-specific types
export interface Profile {
  id: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  role: 'admin' | 'docente' | 'estudiante'
  updated_at?: string
}

export interface AppUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: "admin" | "docente" | "estudiante"
  avatarUrl?: string
  // Keep original fields for backward compatibility if needed, 
  // but we'll primarily use the ones above.
}

export interface AuthSession {
  user: AppUser
  token: string
  expiresAt: number
}
