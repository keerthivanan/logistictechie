'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    We encountered an unexpected error processing your request.
                </p>
                <button
                    onClick={reset}
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
