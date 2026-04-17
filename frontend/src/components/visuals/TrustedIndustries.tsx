'use client';

import { useState } from 'react';

const GIANTS = [
    { name: 'Maersk',        domain: 'maersk.com' },
    { name: 'MSC',           domain: 'msc.com' },
    { name: 'CMA CGM',       domain: 'cma-cgm.com' },
    { name: 'Hapag-Lloyd',   domain: 'hapag-lloyd.com' },
    { name: 'COSCO',         domain: 'cosco.com' },
    { name: 'Evergreen',     domain: 'evergreen-marine.com' },
    { name: 'ONE',           domain: 'one-line.com' },
    { name: 'Yang Ming',     domain: 'yangming.com' },
    { name: 'OOCL',          domain: 'oocl.com' },
    { name: 'ZIM',           domain: 'zim.com' },
    { name: 'DHL',           domain: 'dhl.com' },
    { name: 'Kuehne+Nagel',  domain: 'kuehne-nagel.com' },
    { name: 'DB Schenker',   domain: 'dbschenker.com' },
    { name: 'DSV',           domain: 'dsv.com' },
    { name: 'Expeditors',    domain: 'expeditors.com' },
    { name: 'Flexport',      domain: 'flexport.com' },
    { name: 'CH Robinson',   domain: 'chrobinson.com' },
    { name: 'Agility',       domain: 'agility.com' },
    { name: 'Geodis',        domain: 'geodis.com' },
    { name: 'CEVA Logistics',domain: 'cevalogistics.com' },
];

function GiantLogo({ name, domain }: { name: string; domain: string }) {
    const [failed, setFailed] = useState(false);
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="flex items-center gap-2.5 whitespace-nowrap mx-10 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default group">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 flex-shrink-0">
                {failed ? (
                    <span className="text-[9px] font-bold text-zinc-400">{initials}</span>
                ) : (
                    <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                        alt={name}
                        onError={() => setFailed(true)}
                        className="w-full h-full object-contain p-0.5 filter brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300"
                    />
                )}
            </div>
            <span className="text-sm font-semibold font-inter tracking-wide text-zinc-500 group-hover:text-white transition-colors duration-300">
                {name}
            </span>
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
