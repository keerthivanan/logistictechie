"""
Logistics AI Backend - Ports Router
"""
from fastapi import APIRouter, Query
from typing import List

from app.schemas import Port, PortSearchResponse

router = APIRouter(prefix="/api/ports", tags=["Ports"])

# Sample port data for autocomplete
PORTS_DATABASE = [
    # China
    {"code": "CNSHA", "name": "Shanghai", "country": "China", "type": "port"},
    {"code": "CNSZX", "name": "Shenzhen", "country": "China", "type": "port"},
    {"code": "CNNBO", "name": "Ningbo", "country": "China", "type": "port"},
    {"code": "CNQIN", "name": "Qingdao", "country": "China", "type": "port"},
    {"code": "CNTAO", "name": "Tianjin", "country": "China", "type": "port"},
    {"code": "CNXMN", "name": "Xiamen", "country": "China", "type": "port"},
    {"code": "CNGZU", "name": "Guangzhou", "country": "China", "type": "port"},
    
    # Saudi Arabia
    {"code": "SAJED", "name": "Jeddah Islamic Port", "country": "Saudi Arabia", "type": "port"},
    {"code": "SADMM", "name": "Dammam", "country": "Saudi Arabia", "type": "port"},
    {"code": "SARUH", "name": "Riyadh", "country": "Saudi Arabia", "type": "city"},
    {"code": "SAKAC", "name": "King Abdullah City", "country": "Saudi Arabia", "type": "port"},
    
    # UAE
    {"code": "AEJEA", "name": "Jebel Ali", "country": "UAE", "type": "port"},
    {"code": "AEDXB", "name": "Dubai", "country": "UAE", "type": "city"},
    {"code": "AEAUH", "name": "Abu Dhabi", "country": "UAE", "type": "city"},
    
    # Europe
    {"code": "NLRTM", "name": "Rotterdam", "country": "Netherlands", "type": "port"},
    {"code": "DEHAM", "name": "Hamburg", "country": "Germany", "type": "port"},
    {"code": "BEANR", "name": "Antwerp", "country": "Belgium", "type": "port"},
    {"code": "GBFXT", "name": "Felixstowe", "country": "United Kingdom", "type": "port"},
    {"code": "FRLEH", "name": "Le Havre", "country": "France", "type": "port"},
    
    # Americas
    {"code": "USLAX", "name": "Los Angeles", "country": "United States", "type": "port"},
    {"code": "USLGB", "name": "Long Beach", "country": "United States", "type": "port"},
    {"code": "USNYC", "name": "New York", "country": "United States", "type": "port"},
    {"code": "USHOU", "name": "Houston", "country": "United States", "type": "port"},
    {"code": "CAVRN", "name": "Vancouver", "country": "Canada", "type": "port"},
    {"code": "BRSSZ", "name": "Santos", "country": "Brazil", "type": "port"},
    
    # Asia
    {"code": "SGSIN", "name": "Singapore", "country": "Singapore", "type": "port"},
    {"code": "KRPUS", "name": "Busan", "country": "South Korea", "type": "port"},
    {"code": "JPTYO", "name": "Tokyo", "country": "Japan", "type": "port"},
    {"code": "JPYOK", "name": "Yokohama", "country": "Japan", "type": "port"},
    {"code": "HKHKG", "name": "Hong Kong", "country": "Hong Kong", "type": "port"},
    {"code": "TWKHH", "name": "Kaohsiung", "country": "Taiwan", "type": "port"},
    {"code": "INMUN", "name": "Mumbai (JNPT)", "country": "India", "type": "port"},
    {"code": "INNSA", "name": "Chennai", "country": "India", "type": "port"},
    
    # Africa
    {"code": "ZADUR", "name": "Durban", "country": "South Africa", "type": "port"},
    {"code": "EGPSD", "name": "Port Said", "country": "Egypt", "type": "port"},
    {"code": "MAPTM", "name": "Tanger Med", "country": "Morocco", "type": "port"},
]


@router.get("/search", response_model=PortSearchResponse)
async def search_ports(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(default=10, ge=1, le=50)
):
    """
    Search for ports and cities by name or code.
    
    - **q**: Search query (min 2 characters)
    - **limit**: Max results to return (default 10)
    
    Returns matching ports/cities for autocomplete.
    """
    query = q.lower()
    
    results = []
    for port_data in PORTS_DATABASE:
        if (query in port_data["name"].lower() or 
            query in port_data["code"].lower() or
            query in port_data["country"].lower()):
            results.append(Port(**port_data))
            if len(results) >= limit:
                break
    
    return PortSearchResponse(
        query=q,
        results=results,
        count=len(results)
    )


@router.get("/popular")
async def get_popular_ports():
    """Get list of popular/frequently used ports"""
    popular_codes = ["CNSHA", "SAJED", "AEJEA", "SGSIN", "NLRTM", "USLAX"]
    
    results = [
        Port(**port) for port in PORTS_DATABASE 
        if port["code"] in popular_codes
    ]
    
    return {"ports": results, "count": len(results)}
