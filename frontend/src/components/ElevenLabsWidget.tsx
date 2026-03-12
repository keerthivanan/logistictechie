'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'agent-id'?: string }, HTMLElement>;
        }
    }
}

export function ElevenLabsWidget() {
    useEffect(() => {
        // Only run on client
        if (typeof window !== 'undefined') {
            // The external unpkg script actually defines the custom element itself.
            // DO NOT manually define it, otherwise it causes a NotSupportedError collision.

            // Manually inject the script to bypass Next.js Script component optimizations
            // which sometimes block external web components from rendering correctly.
            const scriptId = 'elevenlabs-widget-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
                script.async = true;
                script.type = 'text/javascript';
                document.body.appendChild(script);
            }
        }
    }, []);

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999999 }}>
            <elevenlabs-convai agent-id="agent_8201kkb3x59ped0bgzfsa2anytxt"></elevenlabs-convai>
        </div>
    );
}
