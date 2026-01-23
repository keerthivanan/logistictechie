"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, MapPin } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { PortAutocomplete } from "@/components/ui/PortAutocomplete";
import { useLanguage } from "@/contexts/LanguageContext";

export function RouteStep() {
    const { t } = useLanguage();
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();

    return (
        <div className="grid lg:grid-cols-2 gap-12">
            {/* Form Side */}
            <div className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight">{t('quote.wizard.route.title')}</h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('quote.wizard.route.origin')}</Label>
                        <PortAutocomplete
                            value={formData.origin}
                            onChange={(val) => updateForm({ origin: val })}
                            placeholder={t('quote.wizard.route.origin_placeholder')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('quote.wizard.route.destination')}</Label>
                        <PortAutocomplete
                            value={formData.destination}
                            onChange={(val) => updateForm({ destination: val })}
                            placeholder={t('quote.wizard.route.dest_placeholder')}
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button variant="outline" size="lg" onClick={prevStep} className="w-1/3">
                        {t('quote.wizard.route.back')}
                    </Button>
                    <Button size="lg" onClick={nextStep} className="w-2/3 bg-blue-600 hover:bg-blue-500 group">
                        {t('quote.wizard.route.next')} <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* Map Side */}
            <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-200 relative bg-gray-100">
                <RouteMap origin={formData.origin} destination={formData.destination} />
            </div>
        </div>
    );
}
