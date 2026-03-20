import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-bg-surface-2 text-text-primary border border-border-default",
                primary: "bg-accent-primary/15 text-accent-primary border border-accent-primary/30",
                danger: "bg-accent-red/15 text-accent-red border border-accent-red/30",
                bronze: "bg-league-bronze/15 text-league-bronze border border-league-bronze/30",
                silver: "bg-league-silver/15 text-league-silver border border-league-silver/30",
                gold: "bg-league-gold/15 text-league-gold border border-league-gold/30",
                platinum: "bg-league-platinum/15 text-league-platinum border border-league-platinum/30",
                diamond: "bg-league-diamond/15 text-league-diamond border border-league-diamond/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}
