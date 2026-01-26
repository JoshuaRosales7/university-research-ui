'use client'

import { Download, Share2 } from 'lucide-react'
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
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        alert('¡Enlace copiado al portapapeles!')
    }

    return (
        <div className="flex flex-wrap gap-3">
            {fileUrl && (
                <Button
                    className="font-black h-12 px-8 gap-2 shadow-lg rounded-xl"
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
                variant="outline"
                className="font-bold h-12 px-8 gap-2 rounded-xl"
                onClick={handleShare}
            >
                <Share2 className="h-4 w-4" /> Compartir
            </Button>
        </div>
    )
}
