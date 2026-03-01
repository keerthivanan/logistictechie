'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
    src?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    shape?: 'circle' | 'square';
    className?: string;
}

export default function Avatar({ src, name, size = 'md', shape = 'circle', className = '' }: AvatarProps) {
    // 💡 SOVEREIGN LOGIC: Handle relative OMEGO storage paths
    const getFullSrc = (url?: string) => {
        if (!url) return undefined;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        // Prepend OMEGO Storage base if it's a relative path
        return `https://ge.omego.online/${url}`;
    };

    const finalSrc = getFullSrc(src);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(finalSrc ? 'loading' : 'error');

    // Reset status when finalSrc changes
    useEffect(() => {
        if (finalSrc) {
            setStatus('loading');
        } else {
            setStatus('error');
        }
    }, [finalSrc]);

    const sizeClasses = {
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
        '2xl': 'w-32 h-32 text-5xl',
    };

    const shapeClasses = {
        circle: 'rounded-full',
        square: 'rounded-[32%] md:rounded-[24%]'
    };

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className={`relative flex-shrink-0 overflow-hidden bg-black border border-white/10 shadow-2xl ${sizeClasses[size]} ${shapeClasses[shape]} ${className}`}>
            {/* Fallback / Initial State */}
            <div className="absolute inset-0 flex items-center justify-center font-black text-white bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08)_0%,rgba(24,24,27,1)_100%)] shadow-inner">
                {name ? (
                    <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{initials}</span>
                ) : (
                    <User className="w-1/2 h-1/2 opacity-20" />
                )}
            </div>

            {/* Image Layer */}
            {finalSrc && status !== 'error' && (
                <img
                    src={finalSrc}
                    alt={name}
                    onLoad={() => {
                        console.log(`Avatar Loaded: ${finalSrc.slice(0, 50)}...`);
                        setStatus('loaded');
                    }}
                    onError={(e) => {
                        console.error(`Avatar Error: ${finalSrc.slice(0, 50)}...`);
                        setStatus('error');
                    }}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out filter brightness-[1.1] ${status === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                        }`}
                />
            )}

            {/* Loading / Glossy Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0" />

            {status === 'loading' && (
                <div className="absolute inset-0 bg-black/40 animate-pulse" />
            )}
        </div>
    );
}
