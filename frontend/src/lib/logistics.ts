import axios from 'axios';

// types/index.ts
export interface QuoteRequest {
    origin: string;
    destination: string;
    container: string;
}

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

    // Sovereign Intelligence
    riskScore: number;
    carbonEmissions: number;
    customsDuty: number;
    portCongestion: number;

    // The Wisdom Layer
    wisdom?: string;
    thc_fee?: number;
    pss_fee?: number;
    fuel_fee?: number;
    contactOffice?: string;

    // Multi-Schedule Intelligence
    vesselName?: string;
    departureDate?: string;
    isFeatured?: boolean;
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:8000/api";

export const logisticsClient = {
    /**
     * Fetch Shipping Rates from Logistics Engine
     */
    /**
     * Fetch Shipping Rates from Logistics Engine
     * Supports Maersk, CMA CGM, MSC, and Hapag-Lloyd integrations.
     */
    getRates: async (req: QuoteRequest): Promise<QuoteResult[]> => {
        try {
            const { data } = await axios.post(`${BACKEND_URL}/quotes/`, {
                origin: req.origin,
                destination: req.destination,
                container: req.container
            });

            if (data && data.success && Array.isArray(data.quotes)) {

                return data.quotes.map((r: {
                    id: string;
                    carrier_name: string;
                    price: number;
                    currency?: string;
                    days: number;
                    transit_time_days?: number;
                    expiration_date?: string;
                    is_real_api_rate?: boolean;
                    surcharges?: any[];
                    risk_score?: number;
                    carbon_emissions?: number;
                    customs_duty_estimate?: number;
                    port_congestion_index?: number;
                    wisdom?: string;
                    thc_fee?: number;
                    pss_fee?: number;
                    fuel_fee?: number;
                    contact_office?: string;
                    vessel_name?: string;
                    departure_date?: string;
                    is_featured?: boolean;
                    type: string
                }, index: number) => {
                    let logo = '/logos/maersk.png';
                    const name = r.carrier_name.toLowerCase();
                    if (name.includes('maersk')) logo = '/logos/maersk.png';
                    else if (name.includes('cma')) logo = '/logos/cma.png';
                    else if (name.includes('msc')) logo = '/logos/msc.png';
                    else if (name.includes('hapag')) logo = '/logos/hapag-lloyd.jpeg';
                    else if (name.includes('hmm')) logo = '/logos/hmm.png';
                    else if (name.includes('one')) logo = '/logos/one.png';
                    else if (name.includes('evergreen')) logo = '/logos/evergreen.png';
                    else if (name.includes('searates')) logo = '/logos/searates.png';
                    else logo = '/logos/carrier-generic.png';

                    return {
                        id: r.id || `quote-${index}-${Date.now()}`,
                        carrier: r.carrier_name,
                        carrier_logo: logo,
                        price: r.price,
                        currency: r.currency || "USD",
                        days: r.transit_time_days || r.days || 0,
                        validUntil: r.expiration_date || "2026-12-31",
                        isReal: r.is_real_api_rate,
                        tags: r.is_featured ? ["AI_PROPHETIC", "OPTIMAL_CORRIDOR"] : ["Direct", "Eco-Select"],
                        fee_breakdown: r.surcharges ? r.surcharges.map((s: any) => ({ name: s.name, amount: s.amount })) : [],

                        // Sovereign Metrics Mapping
                        riskScore: r.risk_score || 0,
                        carbonEmissions: r.carbon_emissions || 0,
                        customsDuty: r.customs_duty_estimate || 0,
                        portCongestion: r.port_congestion_index || 0,

                        // Wisdom Layer
                        wisdom: r.wisdom,
                        thc_fee: r.thc_fee,
                        pss_fee: r.pss_fee,
                        fuel_fee: r.fuel_fee,
                        contactOffice: r.contact_office,

                        // Schedule
                        vesselName: r.vessel_name,
                        departureDate: r.departure_date,
                        isFeatured: r.is_featured
                    };
                });
            }
            return [];
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Logistics Engine Error:", error);
            }
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
                return {
                    status: data.status,
                    eta: data.eta,
                    events: data.events
                };
            }
            return null;
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Tracking API Error:", error);
            }
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
            if (process.env.NODE_ENV === 'development') {
                console.error("Booking API Error:", error);
            }
            return null;
        }
    },

    /**
     * Get Sailing Schedules
     */
    getSchedules: async (origin: string, dest: string, date: string) => {
        try {
            const params = new URLSearchParams({ origin, destination: dest });
            const res = await axios.get(`${BACKEND_URL}/references/schedules?${params.toString()}`);
            return res.data.schedules || [];
        } catch {
            return [];
        }
    },

    /**
     * Get Market Discovery Indices
     */
    getMarketIndices: async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/references/market/indices`);
            return res.data.indices || [];
        } catch {
            return [];
        }
    },

    /**
     * Get Market Trends (AI Forecast)
     */
    getMarketTrends: async (country: string = "GLOBAL", commodity: string = "General Cargo") => {
        try {
            const params = new URLSearchParams({ country, commodity });
            const res = await axios.get(`${BACKEND_URL}/references/market/trends?${params.toString()}`);
            return res.data.trend || null;
        } catch {
            return null;
        }
    }
};

