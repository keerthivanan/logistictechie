import { NextResponse } from 'next/server';
import { logisticsClient } from '@/lib/logistics';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { origin, destination, container } = body;

        console.log(`📡 API: Calculating Quote for ${origin} -> ${destination}`);

        // 1. Get Raw Rates from Logistics Engine (Real Data)
        const rawQuotes = await logisticsClient.getRates({
            origin,
            destination,
            container
        });

        // 2. Return Rates Directly (Pricing logic now handled by Backend/RMS)
        return NextResponse.json({
            success: true,
            quotes: rawQuotes
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to calculate rates" },
            { status: 500 }
        );
    }
}

