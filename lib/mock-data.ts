import type { User, Research, Faculty } from "./types"

export const testUsers: User[] = [
  {
    id: "1",
    name: "María García López",
    email: "maria.garcia@universidad.edu",
    role: "docente",
    faculty: "Facultad de Ingeniería",
    avatar: "/female-student-avatar.png",
  },
  {
    id: "2",
    name: "Carlos Administrador",
    email: "admin@universidad.edu",
    role: "admin",
    faculty: "Rectoría",
    avatar: "/male-administrator.png",
  },
  {
    id: "3",
    name: "Juan Estudiante Pérez",
    email: "juan.estudiante@universidad.edu",
    role: "estudiante",
    faculty: "Facultad de Ciencias",
    avatar: "/young-male-student.png",
  },
]

export let currentUser: User = testUsers[0]

export function setCurrentUser(user: User) {
  currentUser = user
}

export function getCurrentUser(): User {
  return currentUser
}

export const faculties: Faculty[] = [
  {
    id: "1",
    name: "Facultad de Ingeniería",
    collections: [
      { id: "1-1", name: "Tesis de Pregrado", facultyId: "1" },
      { id: "1-2", name: "Tesis de Maestría", facultyId: "1" },
      { id: "1-3", name: "Artículos de Investigación", facultyId: "1" },
    ],
  },
  {
    id: "2",
    name: "Facultad de Ciencias",
    collections: [
      { id: "2-1", name: "Tesis de Pregrado", facultyId: "2" },
      { id: "2-2", name: "Tesis de Doctorado", facultyId: "2" },
      { id: "2-3", name: "Publicaciones Científicas", facultyId: "2" },
    ],
  },
  {
    id: "3",
    name: "Facultad de Humanidades",
    collections: [
      { id: "3-1", name: "Tesis de Pregrado", facultyId: "3" },
      { id: "3-2", name: "Ensayos Académicos", facultyId: "3" },
    ],
  },
  {
    id: "4",
    name: "Facultad de Medicina",
    collections: [
      { id: "4-1", name: "Tesis de Especialidad", facultyId: "4" },
      { id: "4-2", name: "Investigaciones Clínicas", facultyId: "4" },
    ],
  },
]

export const mockResearches: Research[] = [
  {
    id: "1",
    title: "Implementación de Machine Learning para Predicción de Rendimiento Académico",
    authors: ["María García López", "Carlos Rodríguez"],
    abstract:
      "Este estudio presenta un modelo de machine learning para predecir el rendimiento académico de estudiantes universitarios utilizando variables socioeconómicas y académicas previas. Se implementaron algoritmos de Random Forest y redes neuronales, obteniendo una precisión del 87% en las predicciones.",
    keywords: ["machine learning", "predicción académica", "educación superior", "inteligencia artificial"],
    faculty: "Facultad de Ingeniería",
    collection: "Tesis de Pregrado",
    year: 2024,
    status: "aprobado",
    pdfUrl: "/documents/tesis-ml-prediccion.pdf",
    submittedBy: "1",
    submittedAt: new Date("2024-03-15"),
    reviewedBy: "2",
    reviewedAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    title: "Análisis de Impacto Ambiental en Ecosistemas Costeros del Pacífico",
    authors: ["Roberto Sánchez", "Ana María Flores"],
    abstract:
      "Investigación sobre los efectos del cambio climático en los ecosistemas costeros de la región del Pacífico. Se analizaron datos de temperatura, salinidad y biodiversidad durante un período de 5 años.",
    keywords: ["cambio climático", "ecosistemas costeros", "biodiversidad", "impacto ambiental"],
    faculty: "Facultad de Ciencias",
    collection: "Tesis de Doctorado",
    year: 2024,
    status: "en_revision",
    pdfUrl: "/documents/tesis-ecosistemas.pdf",
    submittedBy: "3",
    submittedAt: new Date("2024-06-10"),
  },
  {
    id: "3",
    title: "La Influencia del Arte Precolombino en la Arquitectura Contemporánea",
    authors: ["Laura Mendoza"],
    abstract:
      "Estudio comparativo sobre cómo los elementos del arte precolombino han influenciado el diseño arquitectónico contemporáneo en Latinoamérica, analizando obras de reconocidos arquitectos de la región.",
    keywords: ["arte precolombino", "arquitectura contemporánea", "diseño latinoamericano"],
    faculty: "Facultad de Humanidades",
    collection: "Tesis de Pregrado",
    year: 2023,
    status: "aprobado",
    pdfUrl: "/documents/tesis-arte-arquitectura.pdf",
    submittedBy: "4",
    submittedAt: new Date("2023-11-20"),
    reviewedBy: "5",
    reviewedAt: new Date("2023-12-01"),
  },
  {
    id: "4",
    title: "Desarrollo de Aplicación Móvil para Monitoreo de Pacientes con Diabetes",
    authors: ["Pedro Jiménez", "Carmen Ortiz", "Miguel Torres"],
    abstract:
      "Diseño e implementación de una aplicación móvil que permite el monitoreo continuo de niveles de glucosa en pacientes diabéticos, integrando alertas automáticas y comunicación con profesionales de salud.",
    keywords: ["aplicación móvil", "diabetes", "salud digital", "monitoreo de pacientes"],
    faculty: "Facultad de Medicina",
    collection: "Investigaciones Clínicas",
    year: 2024,
    status: "en_revision",
    pdfUrl: "/documents/app-diabetes.pdf",
    submittedBy: "6",
    submittedAt: new Date("2024-07-05"),
  },
  {
    id: "5",
    title: "Optimización de Redes de Distribución mediante Algoritmos Genéticos",
    authors: ["Fernando Ruiz"],
    abstract:
      "Propuesta de un sistema de optimización para redes de distribución logística utilizando algoritmos genéticos, logrando una reducción del 23% en costos operativos.",
    keywords: ["algoritmos genéticos", "optimización", "logística", "redes de distribución"],
    faculty: "Facultad de Ingeniería",
    collection: "Tesis de Maestría",
    year: 2024,
    status: "borrador",
    pdfUrl: "/documents/tesis-optimizacion.pdf",
    submittedBy: "1",
    submittedAt: new Date("2024-08-01"),
  },
]

export const pendingReviews: Research[] = mockResearches.filter((r) => r.status === "en_revision")
