"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

import { useLanguage } from "@/contexts/LanguageContext";

export function DetailsStep() {
    const { t } = useLanguage();
    const { nextStep, prevStep, formData, updateForm } = useQuoteStore();

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-700">
                    Cargo Details
                </h2>
                <p className="text-muted-foreground mt-2">{t('quote.wizard.details.subtitle')}</p>
            </div>

            <Card className="p-6 space-y-6 bg-white/5 backdrop-blur-md border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ready Date */}
                    <div className="space-y-2">
                        <Label>{t('quote.wizard.details.ready_date')}</Label>
                        <Input
                            type="date"
                            className="bg-background/50 h-12"
                            value={formData.readyDate}
                            onChange={(e) => updateForm({ readyDate: e.target.value })}
                        />
                    </div>

                    {/* Incoterms */}
                    <div className="space-y-2">
                        <Label>{t('quote.wizard.details.incoterms')}</Label>
                        <Select
                            defaultValue={formData.incoterm}
                            onValueChange={(val: any) => updateForm({ incoterm: val })}
                        >
                            <SelectTrigger className="bg-background/50 h-12 rtl:flex-row-reverse">
                                <SelectValue placeholder={t('quote.wizard.details.select_incoterms')} />
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectItem value="FOB">{t('quote.wizard.details.incoterm_opts.fob')}</SelectItem>
                                <SelectItem value="EXW">{t('quote.wizard.details.incoterm_opts.exw')}</SelectItem>
                                <SelectItem value="CIF">{t('quote.wizard.details.incoterm_opts.cif')}</SelectItem>
                                <SelectItem value="DDP">{t('quote.wizard.details.incoterm_opts.ddp')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Commodity */}
                    <div className="col-span-2 space-y-2">
                        <Label>{t('quote.wizard.details.commodity')}</Label>
                        <Input
                            placeholder={t('quote.wizard.details.commodity_placeholder')}
                            className="bg-background/50 h-12 rtl:text-right"
                            value={formData.commodity}
                            onChange={(e) => updateForm({ commodity: e.target.value })}
                        />
                    </div>

                    {/* Total Weight */}
                    <div className="space-y-2">
                        <Label>{t('quote.wizard.details.weight')}</Label>
                        <Input
                            type="number"
                            placeholder="1000"
                            className="bg-background/50 h-12 rtl:text-right"
                            value={formData.weight}
                            onChange={(e) => updateForm({ weight: Number(e.target.value) })}
                        />
                    </div>

                    {/* Total Volume */}
                    <div className="space-y-2">
                        <Label>{t('quote.wizard.details.volume')}</Label>
                        <Input
                            type="number"
                            placeholder="2.5"
                            className="bg-background/50 h-12 rtl:text-right"
                            value={formData.volume}
                            onChange={(e) => updateForm({ volume: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </Card>

            <div className="flex justify-between pt-4">
                <Button onClick={prevStep} variant="ghost" className="text-muted-foreground hover:text-foreground">
                    ← Back to Route
                </Button>
                <Button onClick={nextStep} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                    Find Rates →
                </Button>
            </div>
        </div>
    );
}

