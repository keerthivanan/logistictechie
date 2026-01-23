import { create } from 'zustand';

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
    };
    selectedQuote: any | null;
    setStep: (step: number) => void;
    updateForm: (data: Partial<QuoteState['formData']>) => void;
    selectQuote: (quote: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

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
        readyDate: new Date().toISOString().split('T')[0]
    },
    selectedQuote: null as any | null,
    setStep: (step) => set({ step }),
    updateForm: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
    })),
    selectQuote: (quote: any) => set({ selectedQuote: quote }),
    nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
    prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
}));
