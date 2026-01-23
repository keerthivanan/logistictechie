import { QuoteResult } from './logistics';

export interface RateBreakdown {
    baseRate: number;
    originCharges: number;
    destCharges: number;
    customs: number;
    insurance: number;
    markup: number;
    total: number;
}

export interface PricingParams {
    quotes: QuoteResult[];
    services: {
        customs: boolean;
        insurance: boolean;
        delivery: boolean;
        cargoValue?: number;
    };
}

export const pricingEngine = {
    /**
     * Apply Profit Margin & Service Fees
     */
    calculateFinalRates: (params: PricingParams) => {
        return params.quotes.map(quote => {
            // 1. Base Costs
            const baseMarkups = calculateMarkup(quote);

            // 2. Additional Services
            const services = calculateServices(params.services);

            // 3. Final Total
            const total = quote.price + baseMarkups + services.total;

            return {
                ...quote,
                finalPrice: Math.round(total),
                breakdown: {
                    baseRate: quote.price,
                    markup: baseMarkups,
                    customs: services.customs,
                    insurance: services.insurance,
                    total: Math.round(total)
                }
            };
        });
    }
};

function calculateMarkup(quote: QuoteResult): number {
    // Logic: 20% Base Markup + Variance
    // If "Maersk" (Premium), add extra 2%
    const basePercent = 0.20;
    const premium = quote.carrier.includes('Maersk') ? 0.02 : 0;
    return quote.price * (basePercent + premium);
}

function calculateServices(services: PricingParams['services']) {
    let customs = services.customs ? 1500 : 0; // Fixed Fee
    let insurance = services.insurance && services.cargoValue
        ? services.cargoValue * 0.005 // 0.5% of Cargo Value
        : 0;

    return {
        customs,
        insurance,
        total: customs + insurance
    };
}
