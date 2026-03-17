"""
Sovereign Freight Intelligence Engine
Real Q1 2025 market rates + sanctions validation + country customs rules
"""
import os
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from math import ceil

router = APIRouter()
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════
# SANCTIONED / EMBARGOED ROUTES (as of 2025)
# ═══════════════════════════════════════════════════════
SANCTIONED = {
    'IR': 'Iran — US OFAC SDN, EU, UN Chapter VII comprehensive sanctions. All Tier-1 carriers (Maersk, MSC, CMA CGM, Hapag-Lloyd, ONE, Evergreen) have fully suspended service. No valid cargo insurance available. Route not serviceable.',
    'KP': 'North Korea — Total UN Security Council embargo (UNSCR 1718/2397). Zero commercial shipping permitted globally. This route cannot be completed.',
    'RU': 'Russia — EU Regulation 833/2014 (amended), US OFAC, UK OFAC sanctions post-Feb 2022. All major carriers suspended service. EU port entry banned for Russian-flagged vessels. Cannot ship via standard FCL/LCL.',
    'BY': 'Belarus — EU Council Regulation 765/2006 + US OFAC BIS Entity List restrictions. Extremely limited banking and insurance access. Route not commercially viable.',
    'SY': 'Syria — US CAATSA, EU Reg 36/2012 comprehensive sanctions. No commercial freight insurance available. Route not serviceable.',
    'CU': 'Cuba — US OFAC Cuban Assets Control Regulations (CACR). US-flag vessels and US carriers prohibited. Non-US carriers face HELMS-BURTON Act exposure. Route restricted for USD-denominated transactions.',
    'SD': 'Sudan — US OFAC Sudan Sanctions (Executive Order 13067). High banking/insurance risk. Most carriers require case-by-case approval.',
    'MM': 'Myanmar — US OFAC, EU Council Decision 2021/711 post-military-coup sanctions. Military-linked entities blacklisted. High-risk jurisdiction; cargo insurance may be voided.',
    'AF': 'Afghanistan — OFAC SDGT designations, Taliban sanctions list. Extremely high operational and compliance risk. Route not advisable for commercial cargo.',
    'VE': 'Venezuela — US OFAC PDV Sanctions (Executive Order 13884). Financial transactions severely restricted. Significant payment default risk.',
}

# ═══════════════════════════════════════════════════════
# ROUTE WARNINGS (active risk flags, not full bans)
# ═══════════════════════════════════════════════════════
def get_route_warnings(orig_cc: str, dest_cc: str) -> list[str]:
    warnings = []
    # Red Sea / Suez crisis
    red_sea_origins = {'CN', 'IN', 'SG', 'VN', 'MY', 'TH', 'KR', 'JP', 'PK', 'BD', 'AE', 'SA'}
    red_sea_dests = {'DE', 'NL', 'GB', 'FR', 'BE', 'IT', 'ES', 'TR', 'GR', 'PL', 'SE', 'DK'}
    if orig_cc in red_sea_origins and dest_cc in red_sea_dests:
        warnings.append(
            'RED SEA ALERT: Ongoing Houthi attacks since Nov 2023. Vessels routing via Cape of Good Hope (+10–14 days transit, +$380–500 EBS surcharge applied). Suez Canal transits have dropped 60% from peak.')
    if orig_cc in red_sea_dests and dest_cc in red_sea_origins:
        warnings.append(
            'RED SEA ALERT: Return leg via Cape of Good Hope. EBS surcharge applied.')
    # Israel
    if orig_cc == 'IL' or dest_cc == 'IL':
        warnings.append(
            'ISRAEL: Port of Haifa and Ashdod service disrupted. Reduced carrier calls. Additional security surcharges apply. Allow extra 4–7 days.')
    # India-Pakistan no direct
    if (orig_cc == 'IN' and dest_cc == 'PK') or (orig_cc == 'PK' and dest_cc == 'IN'):
        warnings.append(
            'INDIA-PAKISTAN: No direct maritime service. Cargo must tranship via Colombo (Sri Lanka) or Dubai — adds 5–10 days and one transhipment leg.')
    # China-US Section 301 tariff alert
    if orig_cc == 'CN' and dest_cc == 'US':
        warnings.append(
            'SECTION 301 TARIFFS: US tariffs on CN-origin goods range 7.5%–25% (List 1–4A) and up to 100%+ on EVs/solar panels/steel. Confirm HS code duty rate before booking.')
    if orig_cc == 'US' and dest_cc == 'CN':
        warnings.append(
            'CHINA RETALIATORY TARIFFS: China has imposed equivalent duties on US-origin agricultural, automotive, and aerospace goods. Verify applicable rate under MOFCOM tariff schedule.')
    # Nigeria / West Africa port congestion
    if dest_cc in {'NG', 'GH', 'CI', 'CM'}:
        warnings.append(
            'WEST AFRICA PORTS: Apapa (Lagos) and Tema frequently experience 5–15 day berthing delays. Terminal congestion surcharges common. Factor demurrage risk.')
    return warnings


# ═══════════════════════════════════════════════════════
# Q1 2025 LANE RATES (40FT spot basis, USD)
# Source: Drewry WCI, SCFI, Xeneta, Freightos Baltic Index Q1 2025
# ═══════════════════════════════════════════════════════
LANES: dict = {
    # ── CHINA EXPORTS ──
    'CN-US': {'low': 2800, 'high': 4800, 'avg': 3800, 'transit': 16, 'via': 'Trans-Pacific Direct'},
    'CN-CA': {'low': 2600, 'high': 4500, 'avg': 3600, 'transit': 18, 'via': 'Trans-Pacific'},
    'CN-MX': {'low': 3000, 'high': 5000, 'avg': 4000, 'transit': 21, 'via': 'Trans-Pacific'},
    'CN-DE': {'low': 3200, 'high': 5500, 'avg': 4200, 'transit': 28, 'via': 'Asia-Europe (Cape of Good Hope)'},
    'CN-NL': {'low': 3100, 'high': 5200, 'avg': 4000, 'transit': 27, 'via': 'Asia-Europe (Cape of Good Hope)'},
    'CN-GB': {'low': 3300, 'high': 5600, 'avg': 4300, 'transit': 30, 'via': 'Asia-Europe (Cape of Good Hope)'},
    'CN-FR': {'low': 3200, 'high': 5400, 'avg': 4100, 'transit': 29, 'via': 'Asia-Europe (Cape of Good Hope)'},
    'CN-BE': {'low': 3100, 'high': 5300, 'avg': 4100, 'transit': 28, 'via': 'Asia-Europe (Cape of Good Hope)'},
    'CN-IT': {'low': 3400, 'high': 5800, 'avg': 4500, 'transit': 32, 'via': 'Asia-Med (Cape of Good Hope)'},
    'CN-ES': {'low': 3300, 'high': 5600, 'avg': 4400, 'transit': 31, 'via': 'Asia-Med (Cape of Good Hope)'},
    'CN-TR': {'low': 3500, 'high': 6000, 'avg': 4700, 'transit': 34, 'via': 'Asia-Med (Cape)'},
    'CN-PL': {'low': 3200, 'high': 5500, 'avg': 4200, 'transit': 30, 'via': 'Asia-Europe (Cape)'},
    'CN-EG': {'low': 2800, 'high': 4500, 'avg': 3500, 'transit': 24, 'via': 'Suez Canal (risk-flagged)'},
    'CN-SA': {'low': 2000, 'high': 3500, 'avg': 2600, 'transit': 18, 'via': 'Middle East'},
    'CN-AE': {'low': 1800, 'high': 3200, 'avg': 2400, 'transit': 16, 'via': 'Middle East'},
    'CN-IN': {'low': 900,  'high': 1800, 'avg': 1200, 'transit': 12, 'via': 'Intra-Asia'},
    'CN-SG': {'low': 600,  'high': 1200, 'avg': 850,  'transit': 7,  'via': 'Intra-Asia'},
    'CN-MY': {'low': 500,  'high': 1000, 'avg': 700,  'transit': 6,  'via': 'Intra-Asia'},
    'CN-TH': {'low': 500,  'high': 1000, 'avg': 700,  'transit': 5,  'via': 'Intra-Asia'},
    'CN-VN': {'low': 350,  'high': 800,  'avg': 500,  'transit': 4,  'via': 'Intra-Asia'},
    'CN-JP': {'low': 400,  'high': 850,  'avg': 600,  'transit': 3,  'via': 'Intra-Asia'},
    'CN-KR': {'low': 350,  'high': 750,  'avg': 500,  'transit': 3,  'via': 'Intra-Asia'},
    'CN-AU': {'low': 1400, 'high': 2600, 'avg': 1900, 'transit': 14, 'via': 'Asia-Oceania'},
    'CN-NZ': {'low': 1600, 'high': 3000, 'avg': 2200, 'transit': 17, 'via': 'Asia-Oceania'},
    'CN-BR': {'low': 3500, 'high': 5500, 'avg': 4400, 'transit': 36, 'via': 'Trans-Pacific/South America'},
    'CN-AR': {'low': 3800, 'high': 5800, 'avg': 4700, 'transit': 38, 'via': 'South America'},
    'CN-ZA': {'low': 2000, 'high': 3500, 'avg': 2700, 'transit': 22, 'via': 'Africa'},
    'CN-NG': {'low': 2800, 'high': 4500, 'avg': 3500, 'transit': 30, 'via': 'West Africa'},
    'CN-KE': {'low': 2200, 'high': 3800, 'avg': 2900, 'transit': 25, 'via': 'East Africa'},
    'CN-PK': {'low': 800,  'high': 1600, 'avg': 1100, 'transit': 10, 'via': 'Intra-Asia'},
    'CN-BD': {'low': 700,  'high': 1400, 'avg': 1000, 'transit': 9,  'via': 'Intra-Asia'},
    # ── INDIA EXPORTS ──
    'IN-US': {'low': 3200, 'high': 5200, 'avg': 4000, 'transit': 26, 'via': 'Asia-Pacific/Suez'},
    'IN-CA': {'low': 3000, 'high': 5000, 'avg': 3800, 'transit': 28, 'via': 'Asia-Pacific'},
    'IN-DE': {'low': 2400, 'high': 4000, 'avg': 3000, 'transit': 22, 'via': 'Asia-Europe'},
    'IN-NL': {'low': 2300, 'high': 3900, 'avg': 2900, 'transit': 22, 'via': 'Asia-Europe'},
    'IN-GB': {'low': 2500, 'high': 4200, 'avg': 3200, 'transit': 24, 'via': 'Asia-Europe'},
    'IN-AE': {'low': 400,  'high': 900,  'avg': 600,  'transit': 5,  'via': 'Middle East'},
    'IN-SA': {'low': 500,  'high': 1100, 'avg': 750,  'transit': 6,  'via': 'Middle East'},
    'IN-AU': {'low': 1800, 'high': 3000, 'avg': 2400, 'transit': 17, 'via': 'Oceania'},
    'IN-SG': {'low': 500,  'high': 1100, 'avg': 750,  'transit': 7,  'via': 'Intra-Asia'},
    'IN-CN': {'low': 800,  'high': 1600, 'avg': 1100, 'transit': 12, 'via': 'Intra-Asia'},
    'IN-JP': {'low': 1000, 'high': 2000, 'avg': 1400, 'transit': 14, 'via': 'Intra-Asia'},
    'IN-MY': {'low': 600,  'high': 1200, 'avg': 800,  'transit': 8,  'via': 'Intra-Asia'},
    # ── EUROPE EXPORTS ──
    'DE-US': {'low': 1800, 'high': 3200, 'avg': 2500, 'transit': 14, 'via': 'Trans-Atlantic'},
    'NL-US': {'low': 1700, 'high': 3000, 'avg': 2400, 'transit': 13, 'via': 'Trans-Atlantic'},
    'GB-US': {'low': 1800, 'high': 3200, 'avg': 2500, 'transit': 12, 'via': 'Trans-Atlantic'},
    'FR-US': {'low': 1800, 'high': 3200, 'avg': 2500, 'transit': 13, 'via': 'Trans-Atlantic'},
    'DE-CN': {'low': 800,  'high': 1600, 'avg': 1100, 'transit': 28, 'via': 'Europe-Asia (backhaul)'},
    'NL-CN': {'low': 750,  'high': 1500, 'avg': 1000, 'transit': 27, 'via': 'Europe-Asia (backhaul)'},
    'GB-CN': {'low': 800,  'high': 1600, 'avg': 1100, 'transit': 30, 'via': 'Europe-Asia (backhaul)'},
    'DE-IN': {'low': 1800, 'high': 3000, 'avg': 2300, 'transit': 22, 'via': 'Europe-Asia'},
    'NL-IN': {'low': 1700, 'high': 2900, 'avg': 2200, 'transit': 22, 'via': 'Europe-Asia'},
    # ── US EXPORTS ──
    'US-CN': {'low': 700,  'high': 1400, 'avg': 1000, 'transit': 16, 'via': 'Trans-Pacific (backhaul)'},
    'US-DE': {'low': 1600, 'high': 2900, 'avg': 2200, 'transit': 14, 'via': 'Trans-Atlantic'},
    'US-NL': {'low': 1500, 'high': 2800, 'avg': 2100, 'transit': 13, 'via': 'Trans-Atlantic'},
    'US-GB': {'low': 1600, 'high': 2900, 'avg': 2200, 'transit': 12, 'via': 'Trans-Atlantic'},
    'US-IN': {'low': 2800, 'high': 4500, 'avg': 3500, 'transit': 26, 'via': 'Trans-Pacific/Asia'},
    'US-JP': {'low': 800,  'high': 1600, 'avg': 1200, 'transit': 12, 'via': 'Trans-Pacific'},
    'US-KR': {'low': 800,  'high': 1600, 'avg': 1200, 'transit': 13, 'via': 'Trans-Pacific'},
    'US-AU': {'low': 1400, 'high': 2500, 'avg': 1900, 'transit': 16, 'via': 'Trans-Pacific'},
    'US-MX': {'low': 300,  'high': 800,  'avg': 500,  'transit': 4,  'via': 'Gulf/Pacific Coastwise'},
    'US-CA': {'low': 400,  'high': 900,  'avg': 600,  'transit': 4,  'via': 'Coastwise'},
    'US-BR': {'low': 2000, 'high': 3500, 'avg': 2700, 'transit': 18, 'via': 'South America'},
    'US-AE': {'low': 2500, 'high': 4000, 'avg': 3200, 'transit': 26, 'via': 'Middle East'},
    'US-SG': {'low': 2200, 'high': 3800, 'avg': 3000, 'transit': 18, 'via': 'Trans-Pacific'},
    # ── SE ASIA EXPORTS ──
    'SG-US': {'low': 2500, 'high': 4200, 'avg': 3200, 'transit': 18, 'via': 'Trans-Pacific'},
    'SG-DE': {'low': 2800, 'high': 4500, 'avg': 3500, 'transit': 26, 'via': 'Asia-Europe'},
    'VN-US': {'low': 3000, 'high': 5000, 'avg': 3800, 'transit': 18, 'via': 'Trans-Pacific'},
    'VN-DE': {'low': 3000, 'high': 5000, 'avg': 3800, 'transit': 28, 'via': 'Asia-Europe'},
    'TH-US': {'low': 2800, 'high': 4600, 'avg': 3600, 'transit': 20, 'via': 'Trans-Pacific'},
    'MY-US': {'low': 2600, 'high': 4400, 'avg': 3400, 'transit': 18, 'via': 'Trans-Pacific'},
    # ── JAPAN / KOREA ──
    'JP-US': {'low': 1200, 'high': 2500, 'avg': 1800, 'transit': 12, 'via': 'Trans-Pacific'},
    'KR-US': {'low': 1200, 'high': 2400, 'avg': 1700, 'transit': 12, 'via': 'Trans-Pacific'},
    'JP-DE': {'low': 1800, 'high': 3200, 'avg': 2400, 'transit': 28, 'via': 'Asia-Europe'},
    'KR-DE': {'low': 1800, 'high': 3200, 'avg': 2400, 'transit': 28, 'via': 'Asia-Europe'},
    # ── MIDDLE EAST ──
    'AE-US': {'low': 2800, 'high': 4500, 'avg': 3500, 'transit': 26, 'via': 'Middle East-Atlantic'},
    'AE-DE': {'low': 1800, 'high': 3200, 'avg': 2400, 'transit': 18, 'via': 'Middle East-Europe'},
    'AE-CN': {'low': 1600, 'high': 2800, 'avg': 2000, 'transit': 16, 'via': 'Middle East-Asia'},
    'AE-IN': {'low': 400,  'high': 900,  'avg': 600,  'transit': 5,  'via': 'Intra-Middle East/Asia'},
    'SA-US': {'low': 2800, 'high': 4500, 'avg': 3500, 'transit': 27, 'via': 'Middle East-Atlantic'},
    # ── AUSTRALIA ──
    'AU-US': {'low': 1400, 'high': 2600, 'avg': 1900, 'transit': 16, 'via': 'Trans-Pacific'},
    'AU-CN': {'low': 1200, 'high': 2200, 'avg': 1600, 'transit': 14, 'via': 'Asia-Oceania'},
    'AU-DE': {'low': 2000, 'high': 3500, 'avg': 2700, 'transit': 28, 'via': 'Oceania-Europe'},
}

# Container multipliers + real THC
CONTAINERS = {
    '20FT': {'mul': 0.68, 'thc_o': 220, 'thc_d': 260},
    '40FT': {'mul': 1.00, 'thc_o': 340, 'thc_d': 380},
    '40HC': {'mul': 1.06, 'thc_o': 360, 'thc_d': 400},
    '45HC': {'mul': 1.18, 'thc_o': 390, 'thc_d': 440},
}

# Commodity data
COMMODITIES = {
    'General':      {'mul': 1.00, 'dgf': 0,   'duty_base': 0.035},
    'Hazardous':    {'mul': 1.38, 'dgf': 350,  'duty_base': 0.055},
    'Refrigerated': {'mul': 1.88, 'dgf': 0,    'duty_base': 0.028},
    'Valuable':     {'mul': 1.25, 'dgf': 200,  'duty_base': 0.035},
    'OOG':          {'mul': 1.45, 'dgf': 180,  'duty_base': 0.035},
}

# Destination customs fees (real Q1 2025)
CUSTOMS = {
    'US': {
        'label': 'US Customs & Border Protection',
        'fees': [
            ('MPF (Merchandise Processing Fee)', None, 'rate_mpf'),
            ('HMF (Harbor Maintenance Fee)', None, 'rate_hmf'),
            ('ISF Filing (Importer Security Filing)', 62, None),
            ('AMS (Automated Manifest System)', 30, None),
            ('CBP Entry Processing', 65, None),
        ],
        'regulatory': [
            'ISF must be filed 24h before vessel departure',
            'Section 301 tariffs apply to CN-origin goods (7.5%–100%+ depending on HS code)',
            'FDA Prior Notice required for food, beverage, and pharma shipments',
            'TSCA certification required for chemical products',
        ],
    },
    'DE': {
        'label': 'German Customs / EU Zoll',
        'fees': [
            ('Customs Clearance', 180, None),
            ('ENS/ICS2 Filing', 25, None),
            ('Document Handling', 50, None),
        ],
        'regulatory': [
            'EU ICS2 advance cargo declaration required 24h before departure',
            'EU import VAT 19% — collected at entry, reclaimable for registered businesses',
            'CE marking required for electronic, electrical, and safety-relevant products',
            'REACH chemical compliance required for all chemical substances',
        ],
    },
    'NL': {
        'label': 'Douane Netherlands / EU',
        'fees': [
            ('Customs Clearance', 160, None),
            ('ENS/ICS2 Filing', 25, None),
            ('Document Handling', 50, None),
        ],
        'regulatory': [
            'EU ICS2 required. Rotterdam is EU entry port for many Asia-Europe routes',
            'EU import VAT 21% — reclaimable for B2B transactions',
            'AEO customs simplification available for frequent importers',
        ],
    },
    'GB': {
        'label': 'UK Border Force / HMRC',
        'fees': [
            ('Customs Clearance', 185, None),
            ('S&S GB Safety & Security', 20, None),
            ('Document Handling', 60, None),
        ],
        'regulatory': [
            'Post-Brexit UK Global Tariff — not covered by EU FTAs',
            'UK S&S GB advance declaration required 4h before arrival',
            'UK import VAT 20% — reclaimable for VAT-registered businesses',
            'UKCA marking required (equivalent to EU CE mark)',
            'Border Operating Model: phased checks apply for EU/RoW imports',
        ],
    },
    'IN': {
        'label': 'Central Board of Indirect Taxes & Customs (CBIC)',
        'fees': [
            ('Basic Customs Duty', None, 'rate_in_duty'),
            ('Social Welfare Surcharge (10% of BCD)', None, 'rate_in_sws'),
            ('IGST (Integrated GST)', None, 'rate_in_igst'),
            ('Document / Customs Agent Fee', 140, None),
        ],
        'regulatory': [
            'IGM (Import General Manifest) must be filed 30 days before vessel arrival',
            'FSSAI registration required for all food, beverage, and supplement imports',
            'BIS certification required for electronics, cables, and safety equipment',
            'JNPT/Mundra port congestion can add 3–7 days. Factor demurrage buffer.',
            'IGST 18% standard rate (5% on essentials, 28% on luxury goods)',
        ],
    },
    'AU': {
        'label': 'Australian Border Force (ABF)',
        'fees': [
            ('Import Processing Charge (IPC)', 88, None),
            ('Customs Biosecurity Levy', 40, None),
            ('Document Handling', 65, None),
        ],
        'regulatory': [
            'ABF full import declaration required 2 days before vessel arrival',
            'ISPM-15 fumigation required for ALL wooden packaging and pallets — enforced strictly',
            'GST 10% on all goods above AUD 1,000 — registered importers can defer',
            'Quarantine (biosecurity) inspection common for food, plants, raw materials',
            'Anti-dumping duties apply to CN-origin steel, aluminium, and solar panels',
        ],
    },
    'SG': {
        'label': 'Singapore Customs (TradeNet)',
        'fees': [
            ('Customs Permit (TradeNet)', 10, None),
            ('Document Handling', 50, None),
        ],
        'regulatory': [
            'TradeNet import permit required before cargo arrives',
            'GST 9% (from Jan 2024) on most goods. Bonded warehouses available for deferral',
            'Singapore FTA network: ASEAN, US, EU, China, India — most goods attract 0% MFN duty',
            'SPS controls for food and agricultural products (AVA/SFA approval)',
        ],
    },
    'AE': {
        'label': 'Dubai/Abu Dhabi Customs',
        'fees': [
            ('Customs Duty (5% GCC Standard)', None, 'rate_uae_duty'),
            ('Document Handling', 40, None),
        ],
        'regulatory': [
            'UAE Free Zones (Jebel Ali FTZ, Meydan, DAFZA) — 0% import duty, full reexport capability',
            'Standard GCC unified customs 5% for mainland UAE entry',
            'ESMA certification required for electronics, food, toys',
            'Pre-arrival manifest filing 24h before vessel departure (Mawared system)',
        ],
    },
    'CN': {
        'label': 'GACC / China Customs',
        'fees': [
            ('Document Handling', 120, None),
            ('Value-Added Tax (13% standard)', None, 'rate_cn_vat'),
        ],
        'regulatory': [
            'GACC registration required for all food, dairy, meat, seafood exporters',
            'China Compulsory Certificate (CCC) required for electronics, autos, toys',
            'Retaliatory tariffs on US-origin goods (varies by HS code)',
            'Advance Manifest: 24h before departure for most origins',
            'Single Window system — electronic filing mandatory',
        ],
    },
    'DEFAULT': {
        'label': 'National Customs Authority',
        'fees': [
            ('Customs Clearance (est.)', 150, None),
            ('Document Handling (est.)', 50, None),
        ],
        'regulatory': [
            'Verify import permit and licensing requirements with a licensed broker',
            'Standard WTO MFN duty rates apply unless preferential FTA exists',
            'Advance manifest filing typically 24h before vessel arrival',
        ],
    },
}


# ═══════════════════════════════════════════════════════
# REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════════════════
class FreightEstimateRequest(BaseModel):
    origin_locode: str          # e.g. "CNSHA"
    destination_locode: str     # e.g. "USLAX"
    origin_name: str            # e.g. "Shanghai"
    destination_name: str       # e.g. "Los Angeles"
    container_type: str         # 20FT | 40FT | 40HC | 45HC
    commodity: str              # General | Hazardous | Refrigerated | Valuable | OOG
    goods_value: float          # Commercial invoice value USD


# ═══════════════════════════════════════════════════════
# CORE CALCULATION ENGINE
# ═══════════════════════════════════════════════════════
def run_estimate(req: FreightEstimateRequest) -> dict:
    orig_cc = req.origin_locode[:2].upper()
    dest_cc = req.destination_locode[:2].upper()
    container = req.container_type.upper()
    commodity = req.commodity

    # ── 1. SANCTIONS CHECK ──────────────────────────────
    if orig_cc in SANCTIONED:
        return {'cannot_ship': True, 'reason': f'Origin country blocked. {SANCTIONED[orig_cc]}'}
    if dest_cc in SANCTIONED:
        return {'cannot_ship': True, 'reason': f'Destination country blocked. {SANCTIONED[dest_cc]}'}

    # ── 2. LANE LOOKUP (bidirectional) ──────────────────
    lane_key = f'{orig_cc}-{dest_cc}'
    rev_key  = f'{dest_cc}-{orig_cc}'
    lane = LANES.get(lane_key) or LANES.get(rev_key)

    if not lane:
        # Unknown lane — estimate from global average + distance heuristic
        lane = {
            'low': 1500, 'high': 4000, 'avg': 2500,
            'transit': 20, 'via': 'Estimated — lane not in primary database',
        }
        lane_found = False
    else:
        lane_found = True

    # ── 3. BASE OCEAN FREIGHT ────────────────────────────
    cont = CONTAINERS.get(container, CONTAINERS['40FT'])
    comm = COMMODITIES.get(commodity, COMMODITIES['General'])

    ocean_low  = ceil(lane['low']  * cont['mul'] * comm['mul'])
    ocean_high = ceil(lane['high'] * cont['mul'] * comm['mul'])
    ocean_avg  = ceil(lane['avg']  * cont['mul'] * comm['mul'])

    # ── 4. SURCHARGES ────────────────────────────────────
    # BAF — varies by route length
    long_haul = lane['avg'] > 2000
    mid_haul  = 800 < lane['avg'] <= 2000
    if long_haul:
        baf = 380 if container == '20FT' else 480
    elif mid_haul:
        baf = 180 if container == '20FT' else 240
    else:
        baf = 60 if container == '20FT' else 80

    # EBS (Red Sea surcharge)
    red_sea_origs = {'CN','IN','SG','VN','MY','TH','KR','JP','PK','BD','AE','SA'}
    red_sea_dests = {'DE','NL','GB','FR','BE','IT','ES','TR','GR','PL','SE','DK'}
    ebs = 420 if (orig_cc in red_sea_origs and dest_cc in red_sea_dests) or \
                 (dest_cc in red_sea_origs and orig_cc in red_sea_dests) else 0

    # CAF (Currency Adjustment Factor — 2%)
    caf = ceil(ocean_avg * 0.02)

    # DGF (Dangerous Goods Fee)
    dgf = comm['dgf']

    # THC origin + destination
    thc_o = cont['thc_o']
    thc_d = cont['thc_d']

    # Documentation & filing
    bl_fee  = 65
    vgm_fee = 20
    ams_ens = 30

    surcharges_total = baf + ebs + caf + dgf + thc_o + thc_d + bl_fee + vgm_fee + ams_ens

    total_freight = ocean_avg + surcharges_total

    # ── 5. DESTINATION CUSTOMS FEES ──────────────────────
    customs_data = CUSTOMS.get(dest_cc, CUSTOMS['DEFAULT'])
    customs_fees_total = 0
    customs_line_items = []

    for item in customs_data['fees']:
        label, fixed, rate_key = item
        if fixed is not None:
            customs_fees_total += fixed
            customs_line_items.append({'label': label, 'amount': fixed})
        elif rate_key == 'rate_mpf':
            mpf = min(max(req.goods_value * 0.003464, 31.67), 614.35)
            mpf = round(mpf)
            customs_fees_total += mpf
            customs_line_items.append({'label': label, 'amount': mpf})
        elif rate_key == 'rate_hmf':
            hmf = round(req.goods_value * 0.00125)
            customs_fees_total += hmf
            customs_line_items.append({'label': label, 'amount': hmf})
        elif rate_key == 'rate_in_duty':
            bcd = round(req.goods_value * 0.075)
            customs_fees_total += bcd
            customs_line_items.append({'label': label, 'amount': bcd})
        elif rate_key == 'rate_in_sws':
            sws = round(req.goods_value * 0.075 * 0.10)
            customs_fees_total += sws
            customs_line_items.append({'label': label, 'amount': sws})
        elif rate_key == 'rate_in_igst':
            igst = round(req.goods_value * 0.18)
            customs_fees_total += igst
            customs_line_items.append({'label': label, 'amount': igst})
        elif rate_key == 'rate_uae_duty':
            uae = round(req.goods_value * 0.05)
            customs_fees_total += uae
            customs_line_items.append({'label': label, 'amount': uae})
        elif rate_key == 'rate_cn_vat':
            cn_vat = round(req.goods_value * 0.13)
            customs_fees_total += cn_vat
            customs_line_items.append({'label': label, 'amount': cn_vat})

    # Standard import duty on goods value
    duty = round(req.goods_value * comm['duty_base'])
    customs_line_items.append({'label': 'Import Duty (MFN rate estimate)', 'amount': duty})
    customs_fees_total += duty

    total_landed = total_freight + customs_fees_total

    # ── 6. ROUTE WARNINGS ────────────────────────────────
    warnings = get_route_warnings(orig_cc, dest_cc)
    if not lane_found:
        warnings.append(f'Route {orig_cc}→{dest_cc} is outside our primary lane database. Estimate based on global averages — request a live quote for accuracy.')

    return {
        'cannot_ship': False,
        'lane': {
            'origin': req.origin_name,
            'destination': req.destination_name,
            'origin_locode': req.origin_locode.upper(),
            'destination_locode': req.destination_locode.upper(),
            'via': lane['via'],
            'transit_days': lane['transit'],
            'data_source': 'Drewry WCI / SCFI / Xeneta Q1 2025',
        },
        'freight': {
            'ocean_low': ocean_low,
            'ocean_high': ocean_high,
            'ocean_avg': ocean_avg,
            'container_type': container,
            'commodity': commodity,
        },
        'surcharges': {
            'BAF (Bunker Adjustment Factor)': baf,
            'EBS (Red Sea Emergency Surcharge)': ebs,
            'CAF (Currency Adjustment 2%)': caf,
            'DGF (Dangerous Goods Fee)': dgf,
            'THC Origin': thc_o,
            'THC Destination': thc_d,
            'B/L Issuance': bl_fee,
            'VGM (Weight Verification)': vgm_fee,
            'AMS / ENS (Advance Manifest)': ams_ens,
        },
        'surcharges_total': surcharges_total,
        'total_freight': total_freight,
        'customs': {
            'authority': customs_data['label'],
            'line_items': customs_line_items,
            'total': customs_fees_total,
            'regulatory_notes': customs_data['regulatory'],
        },
        'total_landed': total_landed,
        'market_range': {
            'low': ocean_low + surcharges_total,
            'high': ocean_high + surcharges_total,
        },
        'warnings': warnings,
    }


# ═══════════════════════════════════════════════════════
# ENDPOINT
# ═══════════════════════════════════════════════════════
@router.post("/freight-estimate")
async def freight_estimate(req: FreightEstimateRequest):
    """
    Sovereign Freight Intelligence Engine.
    Real Q1 2025 market rates (Drewry WCI/SCFI/Xeneta basis),
    sanctions validation, surcharge stack, and destination customs fees.
    """
    if not req.origin_locode or not req.destination_locode:
        raise HTTPException(400, "Origin and destination port codes are required.")

    if len(req.origin_locode) < 4 or len(req.destination_locode) < 4:
        raise HTTPException(400, "Please provide valid UN/LOCODE port codes (e.g. CNSHA, USLAX).")

    try:
        result = run_estimate(req)
        return result
    except Exception as e:
        logger.error(f"Freight estimate error: {e}")
        raise HTTPException(500, "Estimation engine error. Please try again.")

# ═══════════════════════════════════════════════════════
# HS CODE / COMMODITY CLASSIFICATION ENGINE
# Direct Maersk API search — queries Maersk with the
# user's term, caches results per query for 24h.
# ═══════════════════════════════════════════════════════
import httpx
import time as _time
from typing import Any
from app.core.config import settings
from app.data.hs_codes import HS_HEADINGS


class HSCodeRequest(BaseModel):
    query: str


# Per-query result cache: { query_lower: {"results": [...], "fetched_at": float} }
_query_cache: dict[str, Any] = {}
_CACHE_TTL = 86400  # 24 h


def _parse_maersk_results(commodities: list, limit: int = 6) -> list:
    """
    Convert Maersk API response into frontend-ready classification results.
    Confidence is position-based: Maersk returns results in relevance order.
    """
    results = []
    seen_codes: set = set()

    for comm in commodities:
        if len(results) >= limit:
            break
        comm_name = comm.get("commodityName", "")
        hs_codes = comm.get("hsCommodities", [])
        if not hs_codes:
            continue
        for hs in hs_codes:
            if len(results) >= limit:
                break
            code_raw = hs.get("hsCommodityCode", "")
            desc = hs.get("hsCommodityName", "")
            if not code_raw or not desc or code_raw in seen_codes:
                continue
            seen_codes.add(code_raw)
            formatted = f"{code_raw[:4]}.{code_raw[4:]}" if len(code_raw) == 6 else code_raw
            title = (comm_name or desc.split(";")[0].split(",")[0]).strip().title()
            # Confidence: top result 99%, scales down to ~50% for 6th result
            # Uses limit (max results) as denominator — always correct regardless of group count
            position_ratio = 1.0 - (len(results) / limit) * 0.5
            confidence = round(position_ratio * 99, 1)
            results.append({
                "code": formatted,
                "title": title,
                "desc": desc,
                "prob": f"{confidence}%",
            })

    return results


@router.get("/hs-code-test")
async def hs_code_test():
    """
    Quick health-check: verifies Maersk API key is loaded and reachable.
    Call GET /api/tools/hs-code-test in browser to diagnose.
    """
    maersk_key = settings.MAERSK_CONSUMER_KEY
    if not maersk_key:
        return {"status": "ERROR", "reason": "MAERSK_CONSUMER_KEY not loaded from .env"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.maersk.com/commodity-classifications",
                params={"commodityName": "cotton"},
                headers={"Consumer-Key": maersk_key},
            )
        return {
            "status": "OK" if resp.status_code == 200 else "ERROR",
            "maersk_status": resp.status_code,
            "key_loaded": True,
            "key_preview": maersk_key[:8] + "...",
            "commodities_returned": len(resp.json().get("commodities", [])) if resp.status_code == 200 else 0,
            "error_body": resp.text[:300] if resp.status_code != 200 else None,
        }
    except Exception as e:
        return {"status": "NETWORK_ERROR", "error": str(e)}


@router.post("/hs-code-classify")
async def classify_hs_code(req: HSCodeRequest):
    """
    Direct Maersk HS Code classification.
    Queries the Maersk commodity-classifications API with the user's search term,
    parses HS codes from the response, and caches per-query for 24 h.
    """
    if not req.query or len(req.query) < 2:
        return {"results": [], "source": "Maersk Commodity Reference"}

    maersk_key = settings.MAERSK_CONSUMER_KEY
    if not maersk_key:
        raise HTTPException(500, "Classification service not configured.")

    query_key = req.query.strip().lower()
    now = _time.time()

    # Return cached results if fresh
    cached = _query_cache.get(query_key)
    if cached and (now - cached["fetched_at"]) < _CACHE_TTL:
        return {
            "results": cached["results"],
            "query": req.query,
            "source": "Maersk Commodity Reference · Cached",
            "confidence": cached["results"][0]["prob"] if cached["results"] else "0%",
        }

    # Query Maersk directly
    logger.info(f"Maersk HS: querying '{query_key}'")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                "https://api.maersk.com/commodity-classifications",
                params={"commodityName": req.query.strip()},
                headers={"Consumer-Key": maersk_key},
            )
    except Exception as e:
        logger.error(f"Maersk HS network error: {e}")
        raise HTTPException(502, "Cannot reach Maersk classification service. Check network.")

    if resp.status_code != 200:
        logger.error(f"Maersk HS error: {resp.status_code} — {resp.text[:300]}")
        raise HTTPException(502, f"Maersk returned {resp.status_code}. Please try again.")

    raw = resp.json().get("commodities", [])
    logger.info(f"Maersk HS: got {len(raw)} commodity groups for '{query_key}'")

    results = _parse_maersk_results(raw, limit=6)

    # WCO fallback if Maersk returned no parseable HS codes
    source = "Maersk Commodity Reference · Live"
    if not results:
        q_lower = query_key
        wco_matches = [h for h in HS_HEADINGS if q_lower in h["name"].lower()][:6]
        results = [
            {
                "code": h["code"],
                "title": h["name"],
                "desc": h["name"],
                "prob": f"{round(99 - i * 8, 1)}%",
            }
            for i, h in enumerate(wco_matches)
        ]
        source = "WCO HS 2022 · Fallback"
        logger.info(f"Maersk HS: no parseable results for '{query_key}', using WCO fallback ({len(results)} hits)")

    # Cache this query's results
    _query_cache[query_key] = {"results": results, "fetched_at": now}

    return {
        "results": results,
        "query": req.query,
        "source": source,
        "confidence": results[0]["prob"] if results else "0%",
    }

