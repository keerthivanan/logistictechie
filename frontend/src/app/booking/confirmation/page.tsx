'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Booking confirmation now happens inside the chat — redirect to messages
export default function ConfirmationPage() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/dashboard/messages')
    }, [router])
    return null
}
