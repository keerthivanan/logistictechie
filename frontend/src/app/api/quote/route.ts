import { NextResponse } from 'next/server';
import { logisticsClient } from '@/lib/logistics';
import { pricingEngine } from '@/lib/pricing';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { origin, destination, container } = body;

        console.log(`📡 API: Calculating Quote for ${origin} -> ${destination}`);

        // 1. Get Raw Rates from Logistics Engine
        const rawQuotes = await logisticsClient.getRates({
            origin,
            destination,
            container
        });

        // 2. Apply Pricing Logic (Markup + Fees)
        const finalRates = pricingEngine.calculateFinalRates({
            quotes: rawQuotes,
            services: {
                customs: true, // Defaulting for MVP
                insurance: true,
                delivery: false
            }
        });

        return NextResponse.json({
            success: true,
            quotes: finalRates
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to calculate rates" },
            { status: 500 }
        );
    }
}
