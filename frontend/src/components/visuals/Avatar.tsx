'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
    src?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');

    // Reset status when src changes
    useEffect(() => {
        if (src) {
            setStatus('loading');
        } else {
            setStatus('error');
        }
    }, [src]);

    const sizeClasses = {
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
        '2xl': 'w-32 h-32 text-5xl',
    };

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className={`relative flex-shrink-0 rounded-full overflow-hidden bg-zinc-900 border border-white/10 ${sizeClasses[size]} ${className}`}>
            {/* Fallback / Initial State */}
            <div className="absolute inset-0 flex items-center justify-center font-black text-white bg-gradient-to-br from-zinc-800 to-zinc-950">
                {name ? initials : <User className="w-1/2 h-1/2 opacity-20" />}
            </div>

            {/* Image Layer */}
            {src && status !== 'error' && (
                <img
                    src={src}
                    alt={name || 'User Avatar'}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            )}

            {/* Loading Pulse */}
            {status === 'loading' && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}
        </div>
    );
}
