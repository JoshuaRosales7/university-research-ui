'use client'

import { useState } from 'react'
import { FileText, Users, Building2, Unlock, GraduationCap, Award, CheckCircle2, Download, Globe, Eye, X } from 'lucide-react'

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-background border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between">
                    <h3 className="text-2xl font-black">{title}</h3>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

// Stats Card Component
function StatCard({ icon: Icon, value, label, description, color, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 text-left w-full"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
            <div className="relative">
                <div className={`h-12 w-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h4 className="text-3xl font-black text-foreground mb-1">{value}</h4>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                {description && (
                    <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">{description}</p>
                )}
            </div>
        </button>
    )
}

export function StatsSection({ stats, facultyStats }: { stats: any; facultyStats: any[] }) {
    const [modalContent, setModalContent] = useState<{ isOpen: boolean; title: string; content: React.ReactNode }>({
        isOpen: false,
        title: '',
        content: null
    })

    const openModal = (title: string, content: React.ReactNode) => {
        setModalContent({ isOpen: true, title, content })
    }

    const closeModal = () => {
        setModalContent({ isOpen: false, title: '', content: null })
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mt-16 pt-16 border-t border-border/40 animate-in fade-in zoom-in duration-1000 delay-300">
                <StatCard
                    icon={FileText}
                    value={`${stats.documents}+`}
                    label="Documentos"
                    description="Investigaciones aprobadas y publicadas"
                    color="text-blue-500"
                    onClick={() => openModal('Documentos Académicos', (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
                                <FileText className="h-12 w-12 text-blue-500 mb-4" />
                                <h4 className="font-bold text-2xl mb-2">{stats.documents}+ Documentos</h4>
                                <p className="text-muted-foreground">Nuestra colección incluye tesis de grado, artículos científicos, proyectos de investigación y publicaciones académicas de alta calidad.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/50 rounded-xl p-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                                    <div className="font-bold">Revisión por pares</div>
                                    <div className="text-sm text-muted-foreground">Todos los documentos son validados</div>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4">
                                    <Download className="h-6 w-6 text-blue-500 mb-2" />
                                    <div className="font-bold">Descarga gratuita</div>
                                    <div className="text-sm text-muted-foreground">Acceso abierto 100%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                />

                <StatCard
                    icon={Users}
                    value={`${stats.authors}+`}
                    label="Autores"
                    description="Investigadores registrados en la plataforma"
                    color="text-amber-500"
                    onClick={() => openModal('Comunidad de Investigadores', (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl p-6 border border-amber-500/20">
                                <Users className="h-12 w-12 text-amber-500 mb-4" />
                                <h4 className="font-bold text-2xl mb-2">{stats.authors}+ Investigadores</h4>
                                <p className="text-muted-foreground">Una comunidad activa de estudiantes, profesores y académicos comprometidos con la generación de conocimiento.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                                    <GraduationCap className="h-8 w-8 text-amber-500" />
                                    <div>
                                        <div className="font-bold">Estudiantes</div>
                                        <div className="text-sm text-muted-foreground">Tesistas y colaboradores</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                                    <Award className="h-8 w-8 text-amber-500" />
                                    <div>
                                        <div className="font-bold">Profesores</div>
                                        <div className="text-sm text-muted-foreground">Asesores y directores</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                />

                <StatCard
                    icon={Building2}
                    value={stats.faculties}
                    label="Facultades"
                    description="Áreas de conocimiento representadas"
                    color="text-rose-500"
                    onClick={() => openModal('Facultades Participantes', (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 rounded-2xl p-6 border border-rose-500/20">
                                <Building2 className="h-12 w-12 text-rose-500 mb-4" />
                                <h4 className="font-bold text-2xl mb-2">{stats.faculties} Facultades</h4>
                                <p className="text-muted-foreground">Investigación multidisciplinaria que abarca diversas áreas del conocimiento humano.</p>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-4">
                                <h5 className="font-bold mb-3">Áreas activas:</h5>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {facultyStats.map((faculty, index) => {
                                        const colors = ['bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-emerald-500', 'bg-purple-500', 'bg-cyan-500']
                                        const color = colors[index % colors.length]
                                        return (
                                            <div key={faculty.name} className="flex items-center justify-between text-sm bg-background/50 rounded-lg p-3 hover:bg-background transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${color}`} />
                                                    <span className="font-medium">{faculty.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>{faculty.count} {faculty.count === 1 ? 'investigación' : 'investigaciones'}</span>
                                                    <span>•</span>
                                                    <span>{faculty.authors} {faculty.authors === 1 ? 'autor' : 'autores'}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                />

                <StatCard
                    icon={Unlock}
                    value="100%"
                    label="Acceso Abierto"
                    description="Todo el contenido es de libre acceso"
                    color="text-emerald-500"
                    onClick={() => openModal('Acceso Abierto', (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl p-6 border border-emerald-500/20">
                                <Unlock className="h-12 w-12 text-emerald-500 mb-4" />
                                <h4 className="font-bold text-2xl mb-2">100% Acceso Abierto</h4>
                                <p className="text-muted-foreground">Creemos en la democratización del conocimiento. Todo nuestro contenido está disponible gratuitamente para la comunidad global.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                                    <Globe className="h-6 w-6 text-emerald-500 mt-1" />
                                    <div>
                                        <div className="font-bold">Sin barreras</div>
                                        <div className="text-sm text-muted-foreground">No requiere suscripción ni pago</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                                    <Eye className="h-6 w-6 text-emerald-500 mt-1" />
                                    <div>
                                        <div className="font-bold">Visibilidad global</div>
                                        <div className="text-sm text-muted-foreground">Indexado en buscadores académicos</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                                    <Download className="h-6 w-6 text-emerald-500 mt-1" />
                                    <div>
                                        <div className="font-bold">Descarga libre</div>
                                        <div className="text-sm text-muted-foreground">PDFs completos sin restricciones</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                />
            </div>

            <Modal isOpen={modalContent.isOpen} onClose={closeModal} title={modalContent.title}>
                {modalContent.content}
            </Modal>
        </>
    )
}
