import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-white mb-4">404</h1>
                <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    The container you are looking for seems to have been lost at sea.
                </p>
                <Link
                    href="/"
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
                >
                    Return Home
                </Link>
            </div>
        </div>
    )
}
