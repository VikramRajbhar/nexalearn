import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string
    fallback?: string
    isOnline?: boolean
    size?: "sm" | "md" | "lg"
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, fallback, isOnline, size = "md", ...props }, ref) => {
        const sizeClasses = {
            sm: "h-8 w-8 text-xs",
            md: "h-12 w-12 text-base",
            lg: "h-16 w-16 text-xl",
        }

        return (
            <div className="relative inline-block" ref={ref} {...props}>
                <div
                    className={cn(
                        "relative flex shrink-0 overflow-hidden rounded-full border-2 border-accent-primary",
                        sizeClasses[size],
                        className
                    )}
                >
                    {src ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={src} alt="Avatar" className="aspect-square h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-bg-surface-2 text-text-primary font-bold">
                            {fallback}
                        </div>
                    )}
                </div>
                {isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-accent-green ring-2 ring-bg-surface animate-glow-pulse" />
                )}
            </div>
        )
    }
)
Avatar.displayName = "Avatar"
