export const APP_CONFIG = {
  // Configuración de Permisos
  permissions: {
    // Roles permitidos para subir nuevas investigaciones
    // Opciones: 'admin', 'docente', 'estudiante'
    uploadResearch: ['admin', 'publicador'] as string[],

    // Roles permitidos para acceder al panel de revisión
    reviewPanel: ['admin', 'publicador'] as string[],
  },

  // Límites de Carga
  uploads: {
    maxFiles: 1,
    maxSizeMB: 10,
    allowedExtensions: ['.pdf'],
  },

  // Configuración General
  features: {
    enablePublicRegistration: true,
    enableComments: true,
  }
}

// Helper para verificar permisos fácilmente
export const canUploadResearch = (userOrRole?: string | { role: string; canUpload?: boolean } | null) => {
  if (!userOrRole) return false

  if (typeof userOrRole === 'string') {
    return APP_CONFIG.permissions.uploadResearch.includes(userOrRole)
  }

  const roleAllowed = APP_CONFIG.permissions.uploadResearch.includes(userOrRole.role)
  const userAllowed = userOrRole.canUpload !== false

  return roleAllowed && userAllowed
}

export const canAccessReviewPanel = (role?: string) => {
  if (!role) return false
  return APP_CONFIG.permissions.reviewPanel.includes(role)
}