'use client';

import { useState } from 'react';

const TOKEN = 'pk_SxrK_VwFRnKNjcykOYBEag';

const GIANTS = [
    { name: 'Maersk',         domain: 'maersk.com' },
    { name: 'MSC',            domain: 'msc.com' },
    { name: 'CMA CGM',        domain: 'cma-cgm.com' },
    { name: 'Hapag-Lloyd',    domain: 'hapag-lloyd.com' },
    { name: 'COSCO',          domain: 'cosco.com' },
    { name: 'Evergreen',      domain: 'evergreen-marine.com' },
    { name: 'ONE',            domain: 'one-line.com' },
    { name: 'Yang Ming',      domain: 'yangming.com' },
    { name: 'OOCL',           domain: 'oocl.com' },
    { name: 'ZIM',            domain: 'zim.com' },
    { name: 'DHL',            domain: 'dhl.com' },
    { name: 'Kuehne+Nagel',   domain: 'kuehne-nagel.com' },
    { name: 'DB Schenker',    domain: 'dbschenker.com' },
    { name: 'DSV',            domain: 'dsv.com' },
    { name: 'Expeditors',     domain: 'expeditors.com' },
    { name: 'Flexport',       domain: 'flexport.com' },
    { name: 'CH Robinson',    domain: 'chrobinson.com' },
    { name: 'Agility',        domain: 'agility.com' },
    { name: 'Nippon Express', domain: 'nipponexpress.com' },
    { name: 'CEVA Logistics', domain: 'cevalogistics.com' },
];

function GiantLogo({ name, domain }: { name: string; domain: string }) {
    const [failed, setFailed] = useState(false);
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="mx-3 sm:mx-5 whitespace-nowrap cursor-default shrink-0">
            <div className="flex items-center justify-center px-5 py-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:border-white/[0.14] transition-colors h-16 w-36">
                {failed ? (
                    <span className="text-sm font-bold text-zinc-500 tracking-wide">{initials}</span>
                ) : (
                    <img
                        src={`https://img.logo.dev/${domain}?token=${TOKEN}&size=400&format=png`}
                        alt={name}
                        onError={() => setFailed(true)}
                        className="h-8 w-auto max-w-[100px] object-contain"
                        style={{ filter: 'grayscale(1) opacity(0.55)' }}
                    />
                )}
            </div>
        </div>
    );
}

export default function TrustedIndustries() {

    return (
        <section className="py-16 bg-black overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            <p className="text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.25em] font-inter mb-10">
                Connecting you to the world's freight giants
            </p>

            <div className="flex w-max animate-infinite-scroll">
                {GIANTS.map((g, i) => (
                    <GiantLogo key={`a-${i}`} name={g.name} domain={g.domain} />
                ))}
                {GIANTS.map((g, i) => (
                    <GiantLogo key={`b-${i}`} name={g.name} domain={g.domain} />
                ))}
            </div>
        </section>
    );
}
