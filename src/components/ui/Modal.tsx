import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
    isOpen: boolean
    onClose: () => void
    title?: string
}

export function Modal({ className, isOpen, onClose, title, children, ...props }: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-sans backdrop-blur-[8px]">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div
                className={cn("relative z-50 w-full max-w-lg rounded-[20px] border border-border-default bg-bg-surface p-6 shadow-lg animate-fade-in", className)}
                {...props}
            >
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between border-b-[3px] border-accent-primary pb-4">
                        {title && <h2 className="font-grotesk text-2xl font-bold text-text-primary">{title}</h2>}
                        <button
                            onClick={onClose}
                            className="text-text-secondary hover:text-primary transition-colors focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                    <div className="pt-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
