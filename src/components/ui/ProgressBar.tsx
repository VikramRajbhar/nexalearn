import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number
    showLabel?: boolean
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
    ({ className, value, showLabel = false, ...props }, ref) => {
        // Clamp value between 0 and 100
        const clampedValue = Math.min(100, Math.max(0, value))

        return (
            <div className="flex flex-col w-full space-y-1" ref={ref} {...props}>
                {showLabel && (
                    <div className="flex justify-end w-full">
                        <span className="text-xs font-semibold text-accent-primary">{clampedValue}%</span>
                    </div>
                )}
                <div
                    className={cn("h-2 w-full overflow-hidden rounded-full bg-bg-surface-2", className)}
                >
                    <div
                        className="h-full bg-gradient-to-r from-accent-primary to-accent-green transition-all duration-500 ease-in-out"
                        style={{ width: `${clampedValue}%` }}
                    />
                </div>
            </div>
        )
    }
)
ProgressBar.displayName = "ProgressBar"
