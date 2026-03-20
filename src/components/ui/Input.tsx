import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, helperText, id, ...props }, ref) => {
        const generatedId = React.useId()
        const inputId = id || generatedId

        return (
            <div className="flex flex-col space-y-1.5 w-full">
                {label && (
                    <label htmlFor={inputId} className="text-sm font-bold leading-none text-text-secondary">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={inputId}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:border-accent-primary focus-visible:ring-[3px] focus-visible:ring-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                        error && "border-accent-red focus-visible:border-accent-red focus-visible:ring-accent-red/15",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-sm font-medium text-accent-red">{error}</p>}
                {helperText && !error && <p className="text-sm text-text-muted">{helperText}</p>}
            </div>
        )
    }
)
Input.displayName = "Input"
