export const DSPACE_CONFIG = {
  baseUrl: "/api/dspace",
  // Authentication endpoints
  endpoints: {
    auth: {
      status: "/authn/status",
      login: "/authn/login",
      logout: "/authn/logout",
    },
    security: {
      csrf: "/security/csrf",
    },
    core: {
      communities: "/core/communities",
      collections: "/core/collections",
      items: "/core/items",
      bundles: "/core/bundles",
      bitstreams: "/core/bitstreams",
    },
    discover: {
      search: "/discover/search/objects",
    },
    submission: {
      workspaceitems: "/submission/workspaceitems",
    },
    eperson: {
      epersons: "/eperson/epersons",
      groups: "/eperson/groups",
      registrations: "/eperson/registrations",
    },
  },
}

export type DSpaceEndpoints = typeof DSPACE_CONFIG.endpoints