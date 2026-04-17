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
        <div className="flex items-center gap-3 whitespace-nowrap mx-12 opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-default group">
            {failed ? (
                <span className="text-sm font-bold text-zinc-400">{initials}</span>
            ) : (
                <img
                    src={`https://img.logo.dev/${domain}?token=${TOKEN}&size=400&format=png`}
                    alt={name}
                    onError={() => setFailed(true)}
                    className="h-14 w-auto max-w-[160px] object-contain transition-opacity duration-300"
                />
            )}
        </div>
    );
}

export default function TrustedIndustries() {
    const repeated = [...GIANTS, ...GIANTS, ...GIANTS];

    return (
        <section className="py-16 bg-black overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            <p className="text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.25em] font-inter mb-10">
                Connecting you to the world's freight giants
            </p>

            <div className="flex animate-infinite-scroll">
                {repeated.map((g, i) => (
                    <GiantLogo key={i} name={g.name} domain={g.domain} />
                ))}
            </div>
        </section>
    );
}
