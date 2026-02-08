"use client";

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuoteStore } from '@/hooks/use-quote';

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
                // Map extracted data to form stores
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

            <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`
                    w-full h-24 rounded-2xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-2 group
                    ${status === 'success'
                        ? 'border-white bg-white/10'
                        : status === 'error'
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-white/10 hover:border-white/30 bg-white/[0.01]'
                    }
                `}
            >
                <AnimatePresence mode="wait">
                    {isUploading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Extracting Intelligence...</span>
                        </motion.div>
                    ) : status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <CheckCircle2 className="w-8 h-8 text-white mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Handshake Complete</span>
                        </motion.div>
                    ) : status === 'error' ? (
                        <motion.div
                            key="error"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Signal Interrupted</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <FileUp className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                                AI Document Scan
                            </span>
                            <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Upload B/L or Invoice</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>

            {/* Holographic Glow behind processing */}
            {isUploading && (
                <div className="absolute inset-0 -z-10 bg-white/5 blur-[40px] rounded-2xl animate-pulse" />
            )}
        </div>
    );
}
