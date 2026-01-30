'use client'

import { Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface ActionButtonsProps {
    investigationId: string
    fileUrl?: string
}

export function ActionButtons({ investigationId, fileUrl }: ActionButtonsProps) {
    const handleDownload = async () => {
        // Registrar descarga
        await supabase.rpc('increment_downloads', { investigation_id: investigationId })
        // No necesitamos toast aquí, la descarga es feedback suficiente, pero podríamos añadir uno
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Enlace copiado', {
            description: 'La URL ha sido copiada al portapapeles.'
        })
    }

    return (
        <div className="flex flex-wrap gap-3">
            {fileUrl && (
                <Button
                    className="font-bold h-11 px-6 gap-2 shadow-lg shadow-primary/20 rounded-xl hover:scale-105 transition-transform"
                    asChild
                >
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" /> Descargar PDF
                    </a>
                </Button>
            )}
            <Button
                variant="secondary"
                className="font-bold h-11 px-6 gap-2 rounded-xl hover:bg-muted-foreground/10 transition-colors"
                onClick={handleShare}
            >
                <Share2 className="h-4 w-4" /> Compartir
            </Button>
        </div>
    )
}
