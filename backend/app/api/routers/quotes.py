from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
import uuid
import json
import logging

from app.core.config import settings
from app.core import security as sec_utils
from app.services.activity import activity_service

_optional_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

router = APIRouter()
logger = logging.getLogger(__name__)


class QuoteRequest(BaseModel):
    origin: str
    destination: str
    container: str = "40FT"
    commodity: str = "General Cargo"
    ready_date: Optional[str] = None
    goods_value: Optional[float] = None


# ── Trade Lane Intelligence ──────────────────────────────────────────────────

ASIA = ["CN", "SHA", "CNSHA", "CNNBO", "CNNGB", "CNTXG", "CNQIN",
        "SG", "SGSIN", "JP", "JPOSA", "JPTYO", "KR", "KRPUS",
        "TW", "TWKEL", "HK", "HKHKG", "VN", "VNSGN", "TH", "THBKK",
        "MY", "MYPKG", "ID", "IDJKT", "PH", "PHMNL"]

US_WEST = ["USLAX", "USLGB", "USSEA", "USPOR", "USOAK"]
US_EAST = ["USNYC", "USSAV", "USHOU", "USBLT", "USORF", "USBOS", "USCHA"]
EUROPE  = ["NLRTM", "DEHAM", "BEANR", "GBFXT", "ESBCN", "FRMRS",
           "ITGOA", "PLGDY", "SEGOT", "DKAAR", "NL", "DE", "GB", "FR"]
MIDEAST = ["AEDXB", "AEJEA", "SADAM", "SAJED", "OMKCT", "QADOH",
           "KWKWI", "BHMNA", "AE", "SA", "OM", "QA", "KW"]

def _match(code: str, regions: list) -> bool:
    c = code.upper()
    return any(c.startswith(r.upper()) or c == r.upper() for r in regions)


def _lane(origin: str, dest: str) -> dict:
    """Returns base pricing and transit config for a trade lane."""
    o, d = origin.upper(), dest.upper()

    if _match(o, ASIA):
        if _match(d, US_WEST):
            return {"base": 2900, "transit": (34, 22, 16), "lane": "Trans-Pacific Westbound",
                    "red_sea": False, "note": "Stable rates; Lunar New Year volumes impacting February schedules"}
        if _match(d, US_EAST):
            return {"base": 4600, "transit": (42, 30, 24), "lane": "Trans-Pacific East Coast (All-Water)",
                    "red_sea": False, "note": "All-water route via Panama; strong demand from US importers"}
        if _match(d, EUROPE):
            return {"base": 4100, "transit": (40, 28, 22), "lane": "Asia-Europe",
                    "red_sea": True, "note": "Red Sea diversion via Cape of Good Hope adding 10-14 days and $600-800 surcharge"}
        if _match(d, MIDEAST):
            return {"base": 2200, "transit": (18, 12, 9), "lane": "Asia-Middle East",
                    "red_sea": True, "note": "Red Sea situation: some carriers re-routing via Cape; confirm routing with carrier"}
        return {"base": 3200, "transit": (35, 25, 18), "lane": "Asia-International",
                "red_sea": False, "note": "Market rate for international routing"}

    if _match(o, EUROPE):
        if _match(d, US_WEST) or _match(d, US_EAST):
            return {"base": 2600, "transit": (18, 14, 10), "lane": "Europe-North America",
                    "red_sea": False, "note": "Transatlantic rates competitive; Hamburg and Rotterdam main hubs"}
        return {"base": 2800, "transit": (30, 22, 16), "lane": "Europe-International",
                "red_sea": False, "note": "Stable transatlantic market conditions"}

    if _match(o, US_WEST) or _match(o, US_EAST):
        if _match(d, ASIA):
            return {"base": 1200, "transit": (25, 18, 14), "lane": "Trans-Pacific Eastbound",
                    "red_sea": False, "note": "Backhaul rates — US exports at discount vs import lane"}
        if _match(d, EUROPE):
            return {"base": 2400, "transit": (16, 12, 9), "lane": "North America-Europe",
                    "red_sea": False, "note": "Competitive transatlantic corridor; multiple direct services available"}

    # Default
    return {"base": 3000, "transit": (35, 25, 18), "lane": "International",
            "red_sea": False, "note": "International routing — confirm exact schedule with carrier"}


CONTAINER_MULT = {
    "20FT": 0.62, "20": 0.62,
    "40FT": 1.0,  "40": 1.0,
    "40HC": 1.06, "40HCFT": 1.06,
    "45HC": 1.18, "45": 1.18,
    "LCL": 0.38,
}

# ── AI Quote Generation ───────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are CargoLink's AI Freight Intelligence Engine — the world's most advanced ocean freight rate analyst.
You have comprehensive, current knowledge of global shipping markets, geopolitics, trade policy, and logistics operations.

YOUR KNOWLEDGE COVERS (apply automatically — no prompting needed):

TARIFF REGIMES:
- US-China: ~145% cumulative US tariffs on Chinese goods (Section 301 + reciprocal, escalated 2025). China retaliates ~125% on US goods. Massive Trans-Pacific front-loading surges.
- US Universal Baseline: 10% tariff on ALL US imports (April 2025 "Liberation Day"). Country-specific reciprocal on top: Vietnam 46%, India 26%, Thailand 36%, Cambodia 49%, Bangladesh 37%, EU ~20%, Japan 24%, South Korea 25%, Canada/Mexico 25% (non-USMCA goods).
- USMCA/CUSMA: Canada and Mexico qualifying goods partially exempt from 25% tariff.
- EU CBAM: Carbon Border Adjustment Mechanism. Steel, aluminum, cement, fertilizers, hydrogen imports to EU require carbon certificates. Cost: €50-80/tonne CO2. Applies from 2025.
- GCC: 5% common external tariff. Saudi Arabia 15% VAT. UAE 5% VAT.
- India: BCD 7.5-30% + IGST 18% + Social Welfare Surcharge 10%.
- WTO MFN rates apply as default where no FTA.
- China +1 diversification: Manufacturers moving from CN to VN/IN/TH/MX to bypass tariffs — VN and India are biggest beneficiaries.

SANCTIONS & EMBARGOES (shipping BLOCKED or severely restricted):
- Russia/Belarus: Full OFAC/EU/UK sanctions. Maersk, MSC, CMA CGM, Hapag-Lloyd, Evergreen all refuse Russian cargo. No Lloyd's war-risk cover for Russian ports. Shadow fleet only.
- Iran: Full OFAC SDN list. No western carriers, no western bank financing, no insurance.
- North Korea: Total UN/OFAC embargo. Any DPRK vessel transshipment triggers secondary sanctions.
- Cuba: US OFAC embargo. EU carriers can operate. US-nexus companies cannot.
- Venezuela: OFAC sectoral sanctions on oil. General cargo restricted.
- Syria: US/EU sanctions. Very limited operations.
- Myanmar: US/EU sanctions on military entities. Screen carefully.
- Yemen/Sudan/Somalia/Libya: Active conflict zones. War-risk surcharge 0.5-2% cargo value.

ACTIVE ROUTING CRISES (apply surcharges and transit adjustments):
- RED SEA (critical, ongoing since Dec 2023): Houthi/Ansar Allah attacks continue. ALL major western carriers routing Asia<->Europe/Middle East/East Africa via Cape of Good Hope. Emergency Bunker Surcharge (EBS): $500-900/container. Transit +10-16 days vs Suez. War-risk insurance +0.5-1.0% cargo value. Suez Canal throughput down 70% from pre-crisis. Some carriers charge BOTH Cape routing fuel cost AND war-risk for Suez attempts.
- PANAMA CANAL: Recovered from 2024 El Nino drought. Near-normal Neo-Panamax slots. Slight premium for guaranteed booking. Dry season (Jan-Apr) risk of minor draft restrictions.
- STRAIT OF HORMUZ: Iran-US tension. War-risk supplement for Persian Gulf ports (AEJEA, KWKWI, BHMNA, IRKHO).
- BLACK SEA: Ukraine conflict ongoing. Ukrainian ports (Odessa corridor) partially open but high-risk. Russian Black Sea ports closed to western carriers.

SHIPPING MARKET BENCHMARKS (most recent known data):
- SCFI Composite: ~2,100 points (elevated vs 2023 trough of ~800 due to Red Sea disruption and tariff front-loading)
- FBXI (Freightos Baltic Index): ~$1,800-2,200/40FT composite
- Drewry WCI: ~$3,000-3,500/40FT weekly composite
- Trans-Pacific Westbound (CNSHA->USLAX): $2,500-4,500/40FT (elevated; tariff front-loading)
- Trans-Pacific Eastbound (backhaul): $800-1,200/40FT
- Asia-Europe via Cape: $3,500-5,500/40FT (Cape routing adds ~$800-1,200 vs pre-Red Sea)
- Asia-Middle East: $1,800-2,800/40FT base + EBS $500-900 for Red Sea lanes
- Europe-North America Transatlantic: $2,200-3,500/40FT
- Intra-Asia: $300-800/TEU
- Bunker fuel VLSFO Singapore: ~$500-560/MT. BAF typically 18-22% of base rate.
- Blank sailings: Up ~8% as carriers manage overcapacity on some lanes

CARRIER ALLIANCES (2025-2026):
- Gemini Alliance: Maersk + Hapag-Lloyd (launched Feb 2025). Hub-and-spoke, premium schedule reliability.
- Ocean Alliance: CMA CGM + COSCO + Evergreen + OOCL. Strong Asia-Europe and Trans-Pacific.
- Premier Alliance: ONE + HMM + Yang Ming. Asia-Pacific and Transatlantic.
- 2M dissolved Jan 2025: Maersk and MSC now fully independent.
- COSCO (Chinese state): Continues Russia/Iran calls that western carriers avoid.
- MSC now world's largest carrier by capacity after post-pandemic ordering spree.

PORT CONDITIONS:
- Shanghai (CNSHA): World's busiest. Congestion spikes during Golden Week, Chinese New Year, post-holiday vessel bunching.
- Singapore (SGSIN): Key transshipment hub. Moderate delays from Cape rerouting volume surge (+15% throughput).
- Rotterdam (NLRTM): Recovering. EU primary entry point for Cape-rerouted Asia-Europe cargo.
- Los Angeles/Long Beach (USLAX/USLGB): Near-normal. Tariff front-loading causing periodic volume spikes.
- Jeddah (SAJED): Near capacity from Saudi Vision 2030 import surge. 1-3 day average berthing delays.
- Dubai Jebel Ali (AEDXB): Generally efficient. Minor delays. Key Middle East transshipment.
- Hamburg (DEHAM): Periodic dockworker union action risk. Monitor for strikes.
- New York/New Jersey (USNYC): ILA longshore contract - stable through 2028 but watch for disputes.
- Antwerp-Bruges (BEANR): Growing as Rotterdam alternative. EU customs gateway.

COMMODITY-SPECIFIC RULES (apply proactively):
- Semiconductors/advanced chips: US BIS export controls. Export license required for China/Russia/Iran/military.
- EV batteries/lithium: Critical minerals tariffs. EU Battery Passport Regulation 2024. IMDG transport restrictions.
- Hazardous/DG: IMDG Code compliance. Carrier acceptance varies by route. Some routes embargoed for certain DG classes.
- Pharmaceuticals: GDP cold-chain compliance. Additional regulatory docs at destination.
- Agricultural/food: Phytosanitary certs. Country-specific import bans.
- Steel/aluminum: CBAM applies to EU imports. US Section 232 tariffs (25% steel, 10% aluminum).
- Timber/wood: EUDR (EU Deforestation Regulation) traceability required from Dec 2024.
- Textiles: Rules of origin scrutiny intensified due to China tariff circumvention via third countries.
- Arms/dual-use: Export license mandatory everywhere. Extreme customs scrutiny.
- Sanctioned goods (luxury to Russia, weapons embargoes): Flag and refuse.

MATH RULE: base_rate + fuel_surcharge + port_fees + surcharges MUST equal total exactly. No exceptions.
WISDOM RULE: Each wisdom sentence must name ONE specific current event, tariff rate, index, or surcharge affecting that exact quote. Never write generic phrases like "good option" or "reliable service"."""


async def _ai_quotes(origin: str, destination: str, container: str,
                     commodity: str, ready_date: str, goods_value: Optional[float]) -> Optional[List[dict]]:
    if not settings.OPENAI_API_KEY:
        return None
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        value_str = f"${goods_value:,.0f} USD" if goods_value else "not disclosed"
        s_origin    = origin.replace("\n", " ").replace("\"", "'")[:50]
        s_dest      = destination.replace("\n", " ").replace("\"", "'")[:50]
        s_container = container.replace("\n", " ").replace("\"", "'")[:20]
        s_commodity = commodity.replace("\n", " ").replace("\"", "'")[:80]
        s_ready_date = ready_date.replace("\n", " ")[:20]

        user_msg = f"""Today's date: {date.today().strftime("%B %d, %Y")}

SHIPMENT:
- Origin: {s_origin}
- Destination: {s_dest}
- Container: {s_container}
- Commodity: {s_commodity}
- Cargo value: {value_str}
- Ready date: {s_ready_date}

Using your freight intelligence knowledge, generate 3 quotes (Economy / Direct / Express) for this exact route and commodity today.
Apply ALL relevant tariffs, surcharges, sanctions checks, and routing constraints automatically.

Return JSON with key "quotes" containing exactly 3 objects, each with:
- carrier_name, price (integer USD), transit_time_days (integer), vessel_name
- wisdom: MANDATORY — cite a SPECIFIC named tariff rate, index value, surcharge name+amount, or named geopolitical event affecting this route's price TODAY. Examples: "US Section 301 tariffs of 145% on Chinese goods are driving front-loading surges on this lane, keeping rates 30% above pre-tariff-war levels." or "Red Sea EBS of $720 applies as Houthi attacks force Cape of Good Hope routing, adding 14 days and $800 to this shipment." NEVER write generic sentences.
- breakdown: {{ base_rate, fuel_surcharge, port_fees, surcharges, total }} — all integers, must sum to price"""

        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user",   "content": user_msg},
            ],
            temperature=0.35,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )
        parsed = json.loads(resp.choices[0].message.content)
        raw_quotes = parsed.get("quotes") or (parsed if isinstance(parsed, list) else None)
        if not raw_quotes:
            return None
        # Fix math: recalculate total from breakdown components to ensure accuracy
        for q in raw_quotes:
            bd = q.get("breakdown", {})
            if bd:
                corrected_total = (
                    int(bd.get("base_rate") or 0) +
                    int(bd.get("fuel_surcharge") or 0) +
                    int(bd.get("port_fees") or 0) +
                    int(bd.get("surcharges") or 0)
                )
                bd["total"] = corrected_total
                q["price"] = corrected_total
        return raw_quotes
    except Exception as e:
        logger.warning(f"[QUOTES] AI generation failed: {e}")
        return None


# ── Deterministic Fallback ────────────────────────────────────────────────────

def _deterministic_quotes(origin: str, destination: str, container: str,
                           commodity: str, goods_value: Optional[float]) -> List[dict]:
    lane_data = _lane(origin, destination)
    base = lane_data["base"]
    t_eco, t_dir, t_exp = lane_data["transit"]
    lane = lane_data["lane"]
    market_note = lane_data["note"]
    red_sea = lane_data["red_sea"]

    cont_key = container.upper().replace(" ", "").replace("FT", "FT")
    cont_mult = CONTAINER_MULT.get(cont_key, CONTAINER_MULT.get(container.upper()[:3], 1.0))

    # Commodity surcharges
    c_lower = commodity.lower()
    if "hazardous" in c_lower or "dangerous" in c_lower:
        commodity_fee = int(base * 0.35)
        commodity_note = "hazardous goods surcharge applied"
    elif "high value" in c_lower or (goods_value and goods_value > 50000):
        commodity_fee = int(base * 0.12)
        commodity_note = "high-value cargo premium applied"
    elif "reefer" in c_lower or "refrigerated" in c_lower or "frozen" in c_lower:
        commodity_fee = int(base * 0.50)
        commodity_note = "reefer surcharge applied"
    else:
        commodity_fee = 0
        commodity_note = ""

    red_sea_fee = 720 if red_sea else 0

    o3 = origin[:3].upper()
    d3 = destination[:3].upper()

    def _make(multiplier: float, transit: int, carrier: str, vessel_word: str, wisdom: str) -> dict:
        base_rate = int(base * cont_mult * multiplier)
        fuel      = int(base_rate * 0.18)
        port      = int(base_rate * 0.07)
        surcharge = commodity_fee + red_sea_fee
        total     = base_rate + fuel + port + surcharge
        return {
            "carrier_name": carrier,
            "price": total,
            "transit_time_days": transit,
            "vessel_name": f"{vessel_word} {o3}-{d3}",
            "wisdom": wisdom,
            "breakdown": {
                "base_rate": base_rate,
                "fuel_surcharge": fuel,
                "port_fees": port,
                "surcharges": surcharge,
                "total": total,
            },
        }

    eco_wisdom = (
        f"Economy routing via transshipment hub — best rate for non-urgent cargo on the {lane} lane. "
        f"{market_note}."
    )
    dir_wisdom = (
        f"PROPHETIC: Optimal direct service for {lane}. Recommended given current market — "
        f"balanced cost-efficiency with reliable schedule. {market_note}."
    )
    exp_wisdom = (
        f"Priority express service — fastest available slot on {lane}. "
        f"Premium reflects reserved vessel capacity and expedited port handling."
    )

    return [
        _make(0.83, t_eco, "CMA CGM",        "PACIFIC BRIDGE",      eco_wisdom),
        _make(1.00, t_dir, "Maersk",         "MAERSK MERIDIAN",     dir_wisdom),
        _make(1.24, t_exp, "Hapag-Lloyd",    "ATLANTIC EXPRESS",    exp_wisdom),
    ]


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/")
async def get_instant_quotes(
    req: QuoteRequest,
    raw_request: Request,
    token: Optional[str] = Depends(_optional_oauth2),
):
    """
    AI-powered instant freight rate engine.
    Uses GPT-4o-mini for market-calibrated predictions.
    Falls back to deterministic trade-lane pricing model if AI unavailable.
    """
    ready = req.ready_date or date.today().isoformat()

    # 1. Try AI
    raw = await _ai_quotes(req.origin, req.destination, req.container,
                           req.commodity, ready, req.goods_value)

    # 2. Deterministic fallback
    if not raw:
        raw = _deterministic_quotes(req.origin, req.destination, req.container,
                                    req.commodity, req.goods_value)

    # 3. Normalize + assign stable IDs
    quotes = []
    for i, q in enumerate(raw):
        route_key = f"{req.origin}-{req.destination}-{q.get('carrier_name', '')}-{i}"
        quote_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, route_key))
        quotes.append({
            "id": quote_id,
            "carrier_name": q.get("carrier_name", "Maersk"),
            "price": float(q.get("price", 0)),
            "transit_time_days": int(q.get("transit_time_days") or q.get("transit_time") or 21),
            "vessel_name": q.get("vessel_name", "TBD"),
            "wisdom": q.get("wisdom", ""),
            "breakdown": q.get("breakdown", {}),
            "origin_locode": req.origin,
            "dest_locode": req.destination,
            "status": "ACTIVE",
        })

    # 4. Log SEARCH activity if user is authenticated (fire-and-forget)
    if token:
        try:
            payload = sec_utils.decode_token(token)
            user_id = payload.get("user_id")
            if user_id:
                from app.db.session import AsyncSessionLocal
                async with AsyncSessionLocal() as db:
                    await activity_service.log(
                        db,
                        user_id=str(user_id),
                        action="SEARCH",
                        entity_type="QUOTE",
                        metadata={
                            "origin": req.origin,
                            "destination": req.destination,
                            "container": req.container,
                            "commodity": req.commodity,
                        }
                    )
        except Exception:
            pass  # Never block quotes due to activity logging failure

    return {"quotes": quotes}
