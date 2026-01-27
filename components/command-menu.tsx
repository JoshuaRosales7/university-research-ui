"use client"

import * as React from "react"
// Fallback icons if lucide not available, but I know lucide is.
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    FileText,
    Home,
    LogOut,
    Moon,
    Sun,
    Laptop
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const { setTheme } = useTheme()
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="relative w-full max-w-sm cursor-pointer"
            >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background text-muted-foreground items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors">
                    <span>Buscar...</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </div>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Escribe un comando o busca..." />
                <CommandList>
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                    <CommandGroup heading="Sugerencias">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                            <Home className="mr-2 h-4 w-4" />
                            <span>Inicio</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/explore'))}>
                            <Search className="mr-2 h-4 w-4" />
                            <span>Explorar Investigaciones</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/my-submissions'))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Mis Envíos</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Configuración">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/profile'))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Perfil</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Ajustes</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Tema">
                        <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Claro</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Oscuro</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                            <Laptop className="mr-2 h-4 w-4" />
                            <span>Sistema</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
