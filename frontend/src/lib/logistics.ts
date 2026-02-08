import axios from 'axios';

// types/index.ts
export interface QuoteRequest {
    origin: string;
    destination: string;
    container: string;
}

// OceanQuote from Backend
// OceanQuote from Backend
export interface QuoteResult {
    id: string; // Generated on frontend or mapped
    carrier: string;
    carrier_logo?: string; // Mapped based on name
    price: number;
    currency: string;
    days: number;
    validUntil: string;
    isReal: boolean;
    tags?: string[];
    fee_breakdown?: { name: string; amount: number }[];

    // 👑 Sovereign Intelligence
    riskScore: number;
    carbonEmissions: number;
    customsDuty: number;
    portCongestion: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";

export const logisticsClient = {
    /**
     * Fetch Shipping Rates from Logistics Engine
     */
    /**
     * Fetch Shipping Rates from Logistics Engine
     */
    getRates: async (req: QuoteRequest): Promise<QuoteResult[]> => {
        try {
            const { data } = await axios.post(`${BACKEND_URL}/quotes/`, {
                origin: req.origin,
                destination: req.destination,
                container: req.container
            });

            if (data && data.success && Array.isArray(data.quotes)) {

                return data.quotes.map((r: any, index: number) => {
                    let logo = '/logos/maersk.png';
                    const name = r.carrier_name.toLowerCase();
                    if (name.includes('maersk')) logo = '/logos/maersk.png';
                    else if (name.includes('cma')) logo = '/logos/cma.png';
                    else if (name.includes('msc')) logo = '/logos/msc.png';
                    else if (name.includes('searates')) logo = '/logos/searates.png';
                    else logo = '/logos/carrier-generic.png';

                    return {
                        id: r.id || `quote-${index}-${Date.now()}`,
                        carrier: r.carrier_name,
                        carrier_logo: logo,
                        price: r.price,
                        currency: r.currency,
                        days: r.transit_time_days,
                        validUntil: r.expiration_date || "2026-12-31",
                        isReal: r.is_real_api_rate,
                        tags: ["Direct", "Eco-Select"], // Elite defaults
                        fee_breakdown: r.surcharges ? r.surcharges.map((s: any) => ({ name: s.name, amount: s.amount })) : [],

                        // 👑 Sovereign Metrics Mapping
                        riskScore: r.risk_score || 0,
                        carbonEmissions: r.carbon_emissions || 0,
                        customsDuty: r.customs_duty_estimate || 0,
                        portCongestion: r.port_congestion_index || 0
                    };
                });
            }
            return [];
        } catch (error) {
            console.error("Logistics Engine Error:", error);
            return [];
        }
    },

    /**
     * Track Container via Logistics Engine
     */
    trackContainer: async (number: string) => {
        try {
            const { data } = await axios.get(`${BACKEND_URL}/tracking/${number}`);
            if (data && data.success && data.data) {
                const b = data.data;
                // Standardize backend data to UI format
                return {
                    status: b.status,
                    eta: "Check Carrier Site", // Default as simulation
                    events: b.events.map((e: string, i: number) => ({
                        event: e,
                        status: i === 0 ? 'done' : i === 1 ? 'current' : 'pending',
                        loc: b.current_location,
                        date: "2026-02-07"
                    }))
                };
            }
            return null;
        } catch (error) {
            console.error("Tracking API Error:", error);
            return null;
        }
    },

    /**
     * Create a Booking
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookQuote: async (bookingData: any) => {
        try {
            const { data } = await axios.post(`${BACKEND_URL}/bookings/`, bookingData);
            if (data && data.success) {
                return data;
            }
            return null;
        } catch (error) {
            console.error("Booking API Error:", error);
            return null;
        }
    }
};
