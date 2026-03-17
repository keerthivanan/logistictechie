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

CARRIERS = ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "Evergreen", "ONE", "COSCO Shipping"]

VESSEL_PREFIXES = ["MERIDIAN", "PACIFIC", "ATLANTIC", "NAVIGATOR", "PIONEER", "HORIZON", "VOYAGER"]


# ── AI Quote Generation ───────────────────────────────────────────────────────

async def _ai_quotes(origin: str, destination: str, container: str,
                     commodity: str, ready_date: str, goods_value: Optional[float]) -> Optional[List[dict]]:
    if not settings.OPENAI_API_KEY:
        return None
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        value_str = f"${goods_value:,.0f} USD" if goods_value else "not specified"
        # Sanitize inputs to prevent simple prompt injection via newlines or quotes
        s_origin = origin.replace("\n", " ").replace("\"", "'")
        s_dest = destination.replace("\n", " ").replace("\"", "'")
        s_container = container.replace("\n", " ").replace("\"", "'")
        s_commodity = commodity.replace("\n", " ").replace("\"", "'")
        s_ready_date = ready_date.replace("\n", " ").replace("\"", "'")

        prompt = f"""You are a freight rate prediction engine for CargoLink, a global logistics marketplace. Current date: March 2026.

Generate 3 realistic freight rate quotes for:
- Route: {s_origin} → {s_dest}
- Container: {s_container} FCL
- Commodity: {s_commodity}
- Cargo value: {value_str}
- Ready date: {s_ready_date}

Current market context (March 2026):
- Red Sea/Suez Canal: Most carriers still routing via Cape of Good Hope for Asia-Europe/Middle East routes (+$600-900 surcharge, +10-14 days)
- Trans-Pacific: Rates stabilizing at $2,500-4,500/40FT after 2024-2025 peak
- Asia-Europe via Cape: $3,500-5,500/40FT
- Bunker fuel surcharge: ~18% of base rate
- Port congestion: Singapore, Rotterdam, LA/LB showing minor delays

Return a JSON object with key "quotes" containing exactly 3 quotes:
1. Economy — via transshipment, slowest, cheapest
2. Direct — standard direct service, mid-range
3. Express — fastest, premium price

Each quote object must have:
- carrier_name: one of ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "Evergreen", "ONE", "COSCO Shipping"]
- price: integer USD total (realistic market rate)
- transit_time_days: integer
- vessel_name: realistic vessel name in format "WORD WORD" (e.g., "PACIFIC MERIDIAN")
- wisdom: one concise sentence about why this option fits current market conditions
- breakdown: object with base_rate, fuel_surcharge, port_fees, surcharges, total (all integers)

Respond ONLY with the JSON object."""

        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.25,
            max_tokens=1200,
            response_format={"type": "json_object"},
        )
        parsed = json.loads(resp.choices[0].message.content)
        return parsed.get("quotes") or (parsed if isinstance(parsed, list) else None)
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
