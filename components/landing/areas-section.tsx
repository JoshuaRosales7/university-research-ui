'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Users, BookOpen, GraduationCap, Award, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

// Area Card Component  
function AreaCard({ label, icon: Icon, color, bg, description, stats }: any) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 text-left w-full"
            >
                <div className={`absolute top-0 right-0 w-32 h-32 ${bg} opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity`} />
                <div className="relative">
                    <div className={`h-14 w-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-black text-xl mb-2">{label}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className={`${color}`}>Ver más</span>
                        <ArrowRight className={`h-3 w-3 ${color} group-hover:translate-x-1 transition-transform`} />
                    </div>
                </div>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={label}>
                <div className="space-y-6">
                    <div className={`h-20 w-20 rounded-3xl ${bg} ${color} flex items-center justify-center`}>
                        <Icon className="h-10 w-10" />
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-2">Descripción</h4>
                        <p className="text-muted-foreground leading-relaxed">{description}</p>
                    </div>

                    {stats && stats.length > 0 && (
                        <div>
                            <h4 className="font-bold text-lg mb-3">Estadísticas</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((stat: any, i: number) => (
                                    <div key={i} className="bg-muted/50 rounded-xl p-4">
                                        <div className="text-2xl font-black mb-1">{stat.value}</div>
                                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button asChild className="w-full" size="lg">
                        <Link href={`/dashboard/explore?faculty=${encodeURIComponent(label)}`}>
                            Explorar {label}
                        </Link>
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export function AreasSection({ facultyStats }: { facultyStats: any[] }) {
    const colorSchemes = [
        { color: "text-blue-500", bg: "bg-blue-500/10", icon: Building2 },
        { color: "text-amber-500", bg: "bg-amber-500/10", icon: Users },
        { color: "text-rose-500", bg: "bg-rose-500/10", icon: Building2 },
        { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: BookOpen },
        { color: "text-purple-500", bg: "bg-purple-500/10", icon: GraduationCap },
        { color: "text-cyan-500", bg: "bg-cyan-500/10", icon: Award },
    ]

    const getDescription = (name: string) => {
        const descriptions: { [key: string]: string } = {
            'Ingeniería': 'Innovación tecnológica, desarrollo de software, sistemas electrónicos, infraestructura y soluciones de ingeniería aplicada a problemas reales.',
            'Ciencias Humanas': 'Estudios sociales, psicología, educación, antropología y análisis del comportamiento humano en diversos contextos culturales.',
            'Arquitectura': 'Diseño urbano, planificación arquitectónica, sostenibilidad, patrimonio cultural y desarrollo de espacios habitables innovadores.',
            'Ciencias Económicas': 'Análisis económico, administración de empresas, finanzas, marketing, emprendimiento y desarrollo de modelos de negocio.',
            'Ciencias de la Salud': 'Investigación médica, salud pública, enfermería, nutrición y promoción del bienestar integral de la población.',
            'Derecho': 'Análisis jurídico, derechos humanos, legislación, justicia social y desarrollo del marco legal contemporáneo.',
        }
        return descriptions[name] || `Investigaciones y estudios especializados en el área de ${name}, contribuyendo al desarrollo académico y científico de la disciplina.`
    }

    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight">Áreas de Conocimiento</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Explora investigaciones organizadas por disciplina académica
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {facultyStats.length > 0 ? (
                        facultyStats.map((faculty, index) => {
                            const scheme = colorSchemes[index % colorSchemes.length]

                            return (
                                <AreaCard
                                    key={faculty.name}
                                    label={faculty.name}
                                    icon={scheme.icon}
                                    color={scheme.color}
                                    bg={scheme.bg}
                                    description={getDescription(faculty.name)}
                                    stats={[
                                        { value: `${faculty.count}`, label: faculty.count === 1 ? 'Investigación' : 'Investigaciones' },
                                        { value: `${faculty.authors}`, label: faculty.authors === 1 ? 'Investigador' : 'Investigadores' },
                                        ...(faculty.careers > 0 ? [{ value: `${faculty.careers}`, label: faculty.careers === 1 ? 'Carrera' : 'Carreras' }] : [])
                                    ]}
                                />
                            )
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <Building2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground">No hay áreas de conocimiento disponibles.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
