"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Card } from "@/components/ui/card";
import { Ship, Plane, Package, Container, Box } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CargoStep() {
    const { t } = useLanguage();
    const { formData, updateForm, nextStep } = useQuoteStore();

    const handleSelect = (type: 'fcl' | 'lcl' | 'air', size: '20' | '40' | '40HC' = '20') => {
        updateForm({ cargoType: type, containerSize: size });
        nextStep();
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{t('quote.wizard.cargo.title')}</h2>
                <p className="text-muted-foreground">{t('quote.wizard.cargo.subtitle')}</p>
            </div>

            <Tabs defaultValue="fcl" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-muted/50 p-1 h-14">
                        <TabsTrigger value="fcl" className="h-12 px-8 text-base">
                            <Ship className="mr-2 h-4 w-4" /> {t('quote.wizard.cargo.fcl')}
                        </TabsTrigger>
                        <TabsTrigger value="lcl" className="h-12 px-8 text-base">
                            <Box className="mr-2 h-4 w-4" /> {t('quote.wizard.cargo.lcl')}
                        </TabsTrigger>
                        <TabsTrigger value="air" className="h-12 px-8 text-base">
                            <Plane className="mr-2 h-4 w-4" /> {t('quote.wizard.cargo.air')}
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* FCL CONTENT */}
                <TabsContent value="fcl" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { id: '20', label: "20' Standard", desc: "For heavy cargo", icon: Container },
                            { id: '40', label: "40' Standard", desc: "For voluminous cargo", icon: Container },
                            { id: '40HC', label: "40' High Cube", desc: "Maximizes volume", icon: Container },
                        ].map((c) => (
                            <motion.div key={c.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                <Card
                                    onClick={() => handleSelect('fcl', c.id as any)}
                                    className="p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group text-center"
                                >
                                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                                        <c.icon className="w-8 h-8 text-blue-600 group-hover:text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg">{c.label}</h3>
                                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                {/* LCL CONTENT */}
                <TabsContent value="lcl">
                    <motion.div whileHover={{ scale: 1.02 }} className="max-w-md mx-auto">
                        <Card
                            onClick={() => handleSelect('lcl')}
                            className="p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center"
                        >
                            <Box className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold text-2xl mb-2">Less than Container Load</h3>
                            <p className="text-muted-foreground mb-6">Pay only for the volume you need. Ideal for 1-15 CBM shipments.</p>
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors w-full">
                                Select LCL
                            </button>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* AIR CONTENT */}
                <TabsContent value="air">
                    <motion.div whileHover={{ scale: 1.02 }} className="max-w-md mx-auto">
                        <Card
                            onClick={() => handleSelect('air')}
                            className="p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center"
                        >
                            <Plane className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold text-2xl mb-2">Air Freight</h3>
                            <p className="text-muted-foreground mb-6">Fastest delivery for urgent shipments. Airport to Airport.</p>
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors w-full">
                                Select Air Freight
                            </button>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
