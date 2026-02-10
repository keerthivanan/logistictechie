"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface FreightosWidgetProps {
    appId?: string; // Optional app ID for some widgets
    widgetType: "CO2" | "FreightEstimator" | "VolumeCalculator" | "FreightClassCalculator" | "ChargeableWeightCalculator";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    title: string;
}

export default function FreightosWidget({ appId, widgetType, config, title }: FreightosWidgetProps) {
    const containerId = `fo-widget-${widgetType}`;

    useEffect(() => {
        // Dynamic script loader based on type
        const scriptId = `script-fo-${widgetType}`;

        if (document.getElementById(scriptId)) return;

        // Determine script source based on type
        let scriptSrc = "https://storage.googleapis.com/freightos-widget-prod/latest/dist/widget.js";
        if (widgetType === "CO2") {
            scriptSrc = "https://storage.googleapis.com/freightos-widget/latest/dist/widget.js";
        }

        // Initialize global object if needed
        // The snippet provided uses an IIFE, we simulate it here.
        const loadWidget = () => {
            try {
                // @ts-expect-error - external legacy widget
                if (window.Fr8osWidget && window.Fr8osWidget.widgets[widgetType]) {
                    // @ts-expect-error - external legacy widget
                    window.Fr8osWidget.widgets[widgetType].run({
                        selector: `#${containerId}`,
                        ...config
                    });
                }
            } catch (e) {
                console.error("Widget Load Error", e);
            }
        };

        const script = document.createElement("script");
        script.id = scriptId;
        // Add cache buster or app param if needed
        script.src = appId ? `${scriptSrc}?app=${appId}` : `${scriptSrc}?nocache=${Math.random()}`;

        script.onload = loadWidget;
        document.body.appendChild(script);

        // Cleanup not strictly possible for global widgets
    }, [appId, widgetType, config, containerId]);

    return (
        <div className="w-full bg-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500">
            <div className="bg-white/[0.03] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white uppercase tracking-tight text-sm">{title}</h3>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="p-6 min-h-[350px] flex items-center justify-center bg-black relative">
                <div id={containerId} className="w-full fo-dark-theme">
                    <div className="flex flex-col items-center justify-center text-gray-600 gap-4 py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                        <span className="text-xs font-bold uppercase tracking-widest">Initialising Widget...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

