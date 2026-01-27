import Image from "next/image"
import { cn } from "@/lib/utils"

interface UniversityLogoProps {
  variant?: "default" | "light" | "compact"
  className?: string
}

export function UniversityLogo({ variant = "default", className = "" }: UniversityLogoProps) {
  if (variant === "compact") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Image
          src="/unis-logo.png"
          alt="UNIS"
          width={28}
          height={28}
          className="object-contain w-7 h-7"
        />
      </div>
    )
  }

  const sizeClass = variant === "light" ? "w-[42px] h-[42px]" : "w-9 h-9"

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/unis-logo.png"
        alt="UNIS"
        width={variant === "light" ? 42 : 36}
        height={variant === "light" ? 42 : 36}
        className={cn("object-contain", sizeClass)}
      />
      <div className="flex flex-col">
        <span className={cn(
          "text-xs font-black leading-tight uppercase tracking-tight",
          variant === "light" ? "text-white" : "text-foreground"
        )}>
          Repositorio
        </span>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest opacity-60",
          variant === "light" ? "text-white" : "text-muted-foreground"
        )}>
          UNIS
        </span>
      </div>
    </div>
  )
}
