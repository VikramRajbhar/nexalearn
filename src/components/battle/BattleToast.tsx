'use client';

import { useState, useEffect } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

let addToastFn: ((message: string, type: Toast['type']) => void) | null = null;

export function showBattleToast(message: string, type: Toast['type'] = 'info') {
    if (addToastFn) addToastFn(message, type);
}

export default function BattleToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        addToastFn = (message: string, type: Toast['type']) => {
            const id = Math.random().toString(36).slice(2);
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 2000);
        };
        return () => { addToastFn = null; };
    }, []);

    const colors = {
        success: 'bg-green-500/90 border-green-400',
        error: 'bg-red-500/90 border-red-400',
        info: 'bg-blue-500/90 border-blue-400',
        warning: 'bg-orange-500/90 border-orange-400',
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`${colors[toast.type]} text-white px-4 py-2 rounded-lg border shadow-lg text-sm font-medium animate-slide-in`}
                    style={{ animation: 'slideIn 0.3s ease-out' }}
                >
                    {toast.message}
                </div>
            ))}
            <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
