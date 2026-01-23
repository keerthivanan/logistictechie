"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, Ship, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { logisticsClient } from "@/lib/logistics";

export function BookingStep() {
    const { t } = useLanguage();
    const { selectedQuote, formData } = useQuoteStore();
    const [bookingRef, setBookingRef] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const book = async () => {
            if (!selectedQuote) return;

            // Prepare payload for backend
            const payload = {
                quote_id: selectedQuote.id,
                origin: formData.origin,
                destination: formData.destination,
                carrier: selectedQuote.carrier,
                price: selectedQuote.price,
                currency: selectedQuote.currency || "USD"
            };

            const res = await logisticsClient.bookQuote(payload);
            if (res && res.success) {
                setBookingRef(res.booking_ref); // Real ID from server
            } else {
                setBookingRef("ERR-FAILED");
            }
            setLoading(false);
        };

        book();
    }, [selectedQuote, formData]);

    if (!selectedQuote) return <div>{t('quote.wizard.booking.no_quote')}</div>;

    if (loading) {
        return (
            <div className="max-w-xl mx-auto text-center space-y-8 py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <h2 className="text-xl font-semibold">Generating Bill of Lading...</h2>
                <p className="text-gray-500">Contacting {selectedQuote.carrier} for space confirmation.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h2 className="text-3xl font-bold">{t('quote.wizard.booking.confirmed')}</h2>
                <p className="text-muted-foreground mt-2">
                    {t('quote.wizard.booking.success')} {t('quote.wizard.booking.ref')} <span className="font-mono text-blue-600">{bookingRef}</span>
                </p>
            </div>

            <Card className="p-6 bg-white border-blue-100 shadow-lg">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Ship className="w-5 h-5 text-blue-600 rtl:scale-x-[-1]" />
                            {selectedQuote.carrier}
                        </h3>
                        <p className="text-sm text-gray-500">{t('quote.wizard.booking.service')}</p>
                    </div>
                    <div className="text-right rtl:text-left">
                        <div className="text-2xl font-bold text-blue-600">${selectedQuote.price?.toLocaleString()}</div>
                        <p className="text-xs text-green-600 font-bold">{t('quote.wizard.booking.paid')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 block">{t('quote.origin')}</span>
                        <span className="font-bold">{formData.origin}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">{t('quote.destination')}</span>
                        <span className="font-bold">{formData.destination}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">{t('quote.wizard.steps.cargo')}</span>
                        <div className="flex items-center gap-1 font-bold">
                            <Package className="w-3 h-3" /> {formData.cargoType.toUpperCase()} ({formData.containerSize})
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500 block">{t('quote.wizard.booking.est_arrival')}</span>
                        <div className="flex items-center gap-1 font-bold">
                            <Calendar className="w-3 h-3" /> {selectedQuote.days} {t('quote.wizard.results.days')}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    {t('quote.wizard.booking.back_home')}
                </Button>
                <Button className="bg-blue-600">
                    {t('quote.wizard.booking.download')}
                </Button>
            </div>
        </div>
    );
}
