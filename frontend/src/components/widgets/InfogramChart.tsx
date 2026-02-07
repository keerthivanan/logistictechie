"use client";

import { useEffect } from "react";

interface InfogramChartProps {
    dataId: string;
    title: string;
    className?: string;
}

/**
 * Embeddable Chart component for Freightos Indices (FAX, FBX)
 */
export default function InfogramChart({ dataId, title, className }: InfogramChartProps) {

    useEffect(() => {
        // Check if script is already loaded
        const scriptId = "infogram-async";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://e.infogram.com/js/dist/embed-loader-min.js";
            script.async = true;
            document.body.appendChild(script);
        } else {
            // Re-initialize if script already exists
            // @ts-expect-error - external library interaction
            if (window.InfogramEmbeds && window.InfogramEmbeds.process) {
                // @ts-expect-error - external library interaction
                window.InfogramEmbeds.process();
            }
        }
    }, []);

    return (
        <div className={`w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 ${className}`}>
            <div
                className="infogram-embed"
                data-id={dataId}
                data-type="interactive"
                data-title={title}
            ></div>
        </div>
    );
}
