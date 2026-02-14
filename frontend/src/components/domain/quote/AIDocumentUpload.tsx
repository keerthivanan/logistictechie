"use client";

import { useState, useRef } from 'react';
import { FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuoteStore } from '@/hooks/use-quote';
import { cn } from '@/lib/utils';

export function AIDocumentUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { updateForm } = useQuoteStore();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setStatus('idle');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/process`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();

            if (result.status === 'success' || result.status === 'simulation') {
                updateForm({
                    origin: result.data.origin || '',
                    destination: result.data.destination || '',
                    commodity: result.data.cargo || 'General Cargo',
                    weight: parseFloat(result.data.weight) || 1000,
                    volume: parseFloat(result.data.volume) || 1,
                });
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Document processing error:', error);
            setStatus('error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={cn(
                    "w-full h-32 rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-3xl",
                    status === 'success'
                        ? 'border-white bg-white/10'
                        : status === 'error'
                            ? 'border-red-500 bg-red-500/5'
                            : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
                )}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Extracting_Intelligence</span>
                    </div>
                ) : status === 'success' ? (
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 text-white mb-4" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Handshake_Complete</span>
                    </div>
                ) : status === 'error' ? (
                    <div className="flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Signal_Interrupted</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                            <FileUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
                            AI_SCANN_SYS
                        </span>
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 italic">
                            UPLOAD_BL_INVOICE
                        </span>
                    </div>
                )}
            </button>
        </div>
    );
}
