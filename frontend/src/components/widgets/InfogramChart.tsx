"use client";

import { useEffect, useRef } from "react";

interface InfogramChartProps {
    dataId: string;
    title: string;
    className?: string;
}

/**
 * Embeddable Chart component for Freightos Indices (FAX, FBX)
 */
export default function InfogramChart({ dataId, title, className }: InfogramChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

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
            // @ts-ignore
            if (window.InfogramEmbeds && window.InfogramEmbeds.process) {
                // @ts-ignore
                window.InfogramEmbeds.process();
            }
        }
    }, []);

    return (
        <div className={`w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 ${className}`}>
            <div
                className="infogram-embed"
                data-id={dataId}
                data-type="interactive"
                data-title={title}
            ></div>
        </div>
    );
}
