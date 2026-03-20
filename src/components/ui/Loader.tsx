import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "inline" | "full-page"
}

export function Loader({ className, variant = "inline", ...props }: LoaderProps) {
    if (variant === "full-page") {
        return (
            <div
                className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", className)}
                {...props}
            >
                <Loader2 className="h-12 w-12 text-accent-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className={cn("flex items-center justify-center p-4", className)} {...props}>
            <Loader2 className="h-8 w-8 text-accent-primary animate-spin" />
        </div>
    )
}
