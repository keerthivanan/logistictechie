import os
import logging
from fastapi import APIRouter
from typing import Dict, Any
from datetime import datetime
from urllib.parse import quote
import httpx
from app.data.hs_codes import HS_HEADINGS
from app.data.ports import MAJOR_PORTS

router = APIRouter()
logger = logging.getLogger(__name__)


def _fallback_ports(q: str, country: str = "") -> Dict[str, Any]:
    """Search the built-in MAJOR_PORTS list — works without any API key."""
    q_lower = q.lower()
    country_lower = country.lower()
    results = []
    for name, city, unlocode, country_name, country_code in MAJOR_PORTS:
        # Filter by country code if provided
        if country and country_code.lower() != country_lower:
            continue
        # Filter by query
        if q_lower and not (
            q_lower in city.lower() or
            q_lower in name.lower() or
            q_lower in unlocode.lower()
        ):
            continue
        results.append({
            "name": name,
            "city": city,
            "code": unlocode,
            "country": country_name,
            "country_code": country_code,
            "region": "",
            "type": "PORT",
        })
    # Exact city-start matches first
    results.sort(key=lambda r: (0 if r["city"].lower().startswith(q_lower) else 1, r["name"]))
    return {"results": results[:20], "source": "builtin"}


@router.get("/ports/search", response_model=Dict[str, Any])
async def search_ports(q: str = "", country: str = "", term_type: str = ""):
    """
    Maersk Locations API — returns terminals, ports and CFS with UNLOCODE.
    term_type: CY (container yard/terminal), CFS (container freight station), Door (skip — use address)
    """
    consumer_key = os.getenv('MAERSK_CONSUMER_KEY')
    if not q.strip():
        return _fallback_ports("", country)
    if not consumer_key:
        return _fallback_ports(q.strip(), country)

    try:
        params = [f"cityName={quote(q.strip())}|contains", "limit=50"]
        if country:
            params.append(f"countryCode={quote(country.strip())}")

        # Request only relevant location types from Maersk to cut noise
        tt = term_type.upper()
        if tt == "CFS":
            params.append("locationType=CONTAINER FREIGHT STATION")
        else:
            # CY / PORT / default → terminals
            params.append("locationType=TERMINAL")

        url = f"https://api.maersk.com/reference-data/locations?{'&'.join(params)}"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url, headers={"Consumer-Key": consumer_key}, timeout=6.0
            )

        if response.status_code != 200:
            logger.error(f"Maersk API {response.status_code}: {response.text[:200]}")
            return _fallback_ports(q.strip(), country)

        data = response.json()
        results = []
        seen: set = set()

        for item in data:
            city_name = item.get("cityName", "").strip()
            location_name = item.get("locationName", "").strip()
            unlocode = item.get("UNLocationCode", "").strip()
            loc_type = item.get("locationType", "")
            country_name = item.get("countryName", "")
            country_code = item.get("countryCode", "")
            region_code = item.get("UNRegionCode", "")

            if not unlocode or not city_name:
                continue

            # Use specific terminal name if available, else city name
            display = location_name if (location_name and location_name != city_name) else city_name

            key = f"{unlocode}_{display.upper()}"
            if key in seen:
                continue
            seen.add(key)

            results.append({
                "name": display,        # display label
                "city": city_name,      # always the city
                "code": unlocode,       # UNLOCODE e.g. "CNSHA"
                "country": country_name,
                "country_code": country_code,
                "region": region_code,
                "type": loc_type,
            })

        # Sort: exact city match first, then alphabetical
        q_lower = q.strip().lower()
        results.sort(key=lambda r: (0 if r["city"].lower().startswith(q_lower) else 1, r["name"]))

        if results:
            return {"results": results[:20], "source": "maersk-live"}

        # Maersk returned nothing — fall through to local fallback
        return _fallback_ports(q.strip(), country)

    except Exception as e:
        logger.error(f"Port Search Error: {e}")
        return _fallback_ports(q.strip(), country)


@router.get("/commodities/search", response_model=Dict[str, Any])
async def search_commodities(q: str = ""):
    """
    Commodity search — Maersk API first, falls back to WCO HS 2022 headings.
    Returns hs_codes array so frontend can auto-fill HS code field.
    """
    consumer_key = os.getenv('MAERSK_CONSUMER_KEY')
    results = []

    if consumer_key:
        try:
            url = "https://api.maersk.com/commodity-classifications"
            if q.strip():
                url += f"?commodityName={quote(q.strip())}"

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url, headers={"Consumer-Key": consumer_key}, timeout=8.0
                )

            if response.status_code == 200:
                data = response.json()
                commodities = data.get("commodities", []) if isinstance(data, dict) else data
                for r in commodities:
                    if not r.get("commodityName"):
                        continue
                    hs_codes = r.get("hsCommodities", [])
                    first_hs = hs_codes[0].get("hsCommodityCode") if hs_codes else None
                    results.append({
                        "id": r.get("commodityCode"),
                        "name": r.get("commodityName"),
                        "type": (r.get("cargoTypes") or ["DRY"])[0],
                        "hs_code": first_hs,  # primary HS code for auto-fill
                        "hs_codes": [
                            {"code": h.get("hsCommodityCode"), "name": h.get("hsCommodityName")}
                            for h in hs_codes if h.get("hsCommodityCode")
                        ],
                    })
        except Exception as e:
            logger.error(f"Commodity Search Error: {e}")

    # Fallback: WCO HS 2022 headings dataset
    if not results:
        q_lower = q.strip().lower()
        hs_results = (
            [h for h in HS_HEADINGS if q_lower in h["name"].lower()]
            if q_lower else HS_HEADINGS
        )
        results = [{"id": h["code"], "name": h["name"], "type": "DRY", "hs_code": h["code"]} for h in hs_results]

    return {"results": results[:50], "source": "WCO HS 2022"}


@router.get("/vessels/search", response_model=Dict[str, Any])
async def search_vessels(q: str = ""):
    """Search active vessels via Maersk reference data."""
    consumer_key = os.getenv('MAERSK_CONSUMER_KEY')
    results = []

    if consumer_key:
        try:
            q_stripped = q.strip()
            if not q_stripped:
                url = "https://api.maersk.com/reference-data/vessels?limit=10"
            elif q_stripped.isdigit():
                url = f"https://api.maersk.com/reference-data/vessels?vesselIMONumbers={quote(q_stripped)}&limit=20"
            else:
                url = f"https://api.maersk.com/reference-data/vessels?vesselNames={quote(q_stripped)}&limit=20"
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url, headers={"Consumer-Key": consumer_key}, timeout=5.0
                )
            if response.status_code == 200:
                data = response.json()
                results = [
                    {
                        "name": r.get("vesselLongName") or r.get("vesselShortName"),
                        "imo": r.get("vesselIMONumber"),
                        "flag": r.get("vesselFlagCode"),
                        "capacity": r.get("vesselCapacityTEU"),
                    }
                    for r in data
                    if r.get("vesselLongName") or r.get("vesselShortName")
                ]
        except Exception as e:
            logger.error(f"Vessel Search Error: {e}")

    return {"results": results[:20], "source": "Maersk Vessel DB"}


@router.get("/market/indices", response_model=Dict[str, Any])
async def get_market_indices():
    return {
        "success": True,
        "indices": [
            {"id": "01", "name": "SCFI_INDEX", "value": "2,143.50", "change": "+0.45%", "status": "BULLISH"},
            {"id": "03", "name": "FBXI_INDEX", "value": "1,840.20", "change": "-0.12%", "status": "NEUTRAL"},
        ],
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/schedules", response_model=Dict[str, Any])
async def get_sailing_schedules(origin: str = "Shanghai", destination: str = "Jeddah"):  # noqa: ARG001
    from datetime import timedelta
    today = datetime.now()
    schedules = []
    for i in range(1, 3):
        dep = today + timedelta(days=5 * i)
        arr = dep + timedelta(days=18)
        schedules.append({
            "carrier": "CargoLink Carrier",
            "vessel": f"CL {origin.upper()[:3]} PIONEER",
            "voyage": f"{dep.strftime('%y')}{i}W",
            "departure": dep.isoformat(),
            "arrival": arr.isoformat(),
            "transit_time": 18,
            "service": "Direct",
            "is_estimate": True,
        })
    return {"schedules": schedules, "success": True, "count": len(schedules), "source": "CargoLink Core"}
