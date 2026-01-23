import axios from 'axios';

// types/index.ts
export interface QuoteRequest {
    origin: string;
    destination: string;
    container: string;
}

export interface QuoteResult {
    id: string;
    carrier: string;
    carrier_logo?: string;
    price: number;
    currency: string;
    days: number;
    validUntil: string;
    isReal: boolean;
    co2_emissions?: number;
}

const BACKEND_URL = "http://localhost:8000/api";

export const logisticsClient = {
    /**
     * Fetch Shipping Rates from Logistics Engine
     */
    getRates: async (req: QuoteRequest): Promise<QuoteResult[]> => {
        try {
            const { data } = await axios.post(`${BACKEND_URL}/quotes/`, {
                origin: req.origin,
                destination: req.destination,
                cargo_type: req.container
            });

            if (data && data.success && Array.isArray(data.quotes)) {
                return data.quotes.map((r: any) => ({
                    id: r.id,
                    carrier: r.carrier,
                    carrier_logo: r.carrier_logo,
                    price: r.price,
                    currency: r.currency,
                    days: r.transit_days,
                    validUntil: r.valid_until,
                    isReal: r.is_real
                }));
            }
            return [];
        } catch (error) {
            console.error("Logistics Engine Error:", error);
            // Fallback to empty array to handle gracefully
            return [];
        }
    },

    /**
     * Track Container via Logistics Engine
     */
    trackContainer: async (number: string) => {
        try {
            const { data } = await axios.get(`${BACKEND_URL}/tracking/${number}`);
            if (data && data.success) {
                return data;
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
