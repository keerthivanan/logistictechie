'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Booking now happens inside the chat — redirect to messages
export default function BookingPage() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/dashboard/messages')
    }, [router])
    return null
}
