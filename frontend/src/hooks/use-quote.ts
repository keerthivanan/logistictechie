import { create } from 'zustand';
import { QuoteResult } from '@/lib/logistics';

interface QuoteState {
    step: number;
    formData: {
        origin: string;
        destination: string;
        cargoType: 'fcl' | 'lcl' | 'air';
        containerSize: '20' | '40' | '40HC';

        // Detailed Logistics Data
        incoterm: 'EXW' | 'FCA' | 'FOB' | 'CFR' | 'CIF' | 'DAP' | 'DDP';
        commodity: string;
        weight: number;
        volume: number;
        readyDate: string;

        // Recommended Services (Step 4)
        needsInsurance: boolean;
        needsCustomsBrokerage: boolean;
        portChargesCoveredBy: 'agent' | 'supplier';
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedQuote: (QuoteResult & Record<string, any>) | null;
    setStep: (step: number) => void;
    updateForm: (data: Partial<QuoteState['formData']>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectQuote: (quote: QuoteResult & Record<string, any>) => void;
    nextStep: () => void;
    prevStep: () => void;
}
// ...
export const useQuoteStore = create<QuoteState>((set) => ({
    step: 1,
    formData: {
        origin: '',
        destination: '',
        cargoType: 'fcl',
        containerSize: '20',
        incoterm: 'FOB',
        commodity: 'General Cargo',
        weight: 1000,
        volume: 1,
        readyDate: new Date().toISOString().split('T')[0],
        needsInsurance: true,
        needsCustomsBrokerage: true,
        portChargesCoveredBy: 'agent'
    },
    selectedQuote: null,
    setStep: (step) => set({ step }),
    updateForm: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectQuote: (quote: QuoteResult & Record<string, any>) => set({ selectedQuote: quote }),
    nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
    prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
}));

