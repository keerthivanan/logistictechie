export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const sizes = { sm: 'w-4 h-4 border-[1.5px]', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-2' }
    return (
        <div
            className={`rounded-full border-zinc-800 border-t-zinc-400 animate-spin ${sizes[size]} ${className}`}
        />
    )
}

export function PageSpinner() {
    return (
        <div className="h-full min-h-[200px] flex items-center justify-center">
            <Spinner size="md" />
        </div>
    )
}

export function FullPageSpinner() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Spinner size="md" />
        </div>
    )
}
