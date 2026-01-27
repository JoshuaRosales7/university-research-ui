"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Quote, BookText, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CitationModalProps {
    research: {
        title: string
        authors: string[]
        year: string
        created_at: string
        id: string
        doi?: string
    }
}

export function CitationModal({ research }: CitationModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [origin, setOrigin] = useState("")

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const authorsText = Array.isArray(research.authors) ? research.authors.join(", ") : research.authors || "Autor desconocido"
    const firstAuthor = Array.isArray(research.authors) ? research.authors[0] : (String(research.authors || "Autor")).split(" ")[0]

    // Format generators
    // We use the local resolver URL so the link actually works for this system's internal DOIs
    const doiUrl = research.doi ? `${origin}/doi/${research.doi}` : ""

    // Validar si el DOI comienza con http (ya es una URL) o no
    const displayDoi = research.doi?.startsWith('http') ? research.doi : doiUrl

    const formats = {
        apa: `${authorsText}. (${research.year}). ${research.title}. Repositorio Universitario. ${displayDoi}`,
        ieee: `${authorsText}, "${research.title}," Repositorio Universitario, ${research.year}${displayDoi ? `, doi: ${displayDoi}.` : "."}`,
        mla: `${firstAuthor}, et al. "${research.title}." Repositorio Universitario, ${research.year}${displayDoi ? `, ${displayDoi}.` : "."}`,
        bibtex: `@article{${firstAuthor}${research.year},
  title={${research.title}},
  author={${authorsText}},
  journal={Repositorio Universitario},
  year={${research.year}}${research.doi ? `,\n  doi={${research.doi}},\n  url={${displayDoi}}` : ""}
}`
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Cita copiada al portapapeles", {
            icon: "📋"
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="font-bold h-11 px-6 gap-2 rounded-xl bg-background/50 hover:bg-background">
                    <Quote className="h-4 w-4" /> Citar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Quote className="h-5 w-5 text-primary" />
                        Generar Cita
                    </DialogTitle>
                    <DialogDescription>
                        Copia la referencia bibliográfica en el formato que necesites.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="apa" className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-4 rounded-xl h-10 p-1">
                        <TabsTrigger value="apa" className="rounded-lg text-xs font-bold">APA 7</TabsTrigger>
                        <TabsTrigger value="ieee" className="rounded-lg text-xs font-bold">IEEE</TabsTrigger>
                        <TabsTrigger value="mla" className="rounded-lg text-xs font-bold">MLA</TabsTrigger>
                        <TabsTrigger value="bibtex" className="rounded-lg text-xs font-bold">BibTeX</TabsTrigger>
                    </TabsList>

                    {Object.entries(formats).map(([key, value]) => (
                        <TabsContent key={key} value={key} className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Textarea
                                        readOnly
                                        value={value}
                                        className="min-h-[120px] font-mono text-sm bg-muted/50 resize-none rounded-xl pr-12 leading-relaxed"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                        onClick={() => copyToClipboard(value)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                                    <Check className="h-3 w-3 text-emerald-500" /> Verificado para uso académico
                                </p>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
