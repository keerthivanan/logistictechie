"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface FreightosWidgetProps {
    appId?: string; // Optional app ID for some widgets
    widgetType: "CO2" | "FreightEstimator" | "VolumeCalculator" | "FreightClassCalculator" | "ChargeableWeightCalculator";
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
                // @ts-ignore
                if (window.Fr8osWidget && window.Fr8osWidget.widgets[widgetType]) {
                    // @ts-ignore
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
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{title}</h3>
            </div>
            <div className="p-4 min-h-[300px] flex items-center justify-center bg-white relative">
                <div id={containerId} className="w-full">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2 py-10">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-sm">Loading widget...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
