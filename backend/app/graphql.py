"""
Logistics AI Backend - GraphQL Schema
====================================================
Defines the GraphQL API using Strawberry.
Wraps the core simulation engine to provide a modern query interface.
"""
import strawberry
from typing import List, Optional
from app.services.freight_engine import get_freight_engine
from app.schemas import QuoteRequest, CargoType

@strawberry.type
class Quote:
    """A shipping rate quote"""
    id: str
    carrier: str
    carrier_logo: Optional[str]
    price: float
    currency: str
    ocean_freight: float
    surcharges: float
    insurance_cost: float
    transit_days: int
    valid_until: str
    route_details: str
    is_real: bool

@strawberry.type
class Query:
    @strawberry.field
    async def quotes(self, origin: str, destination: str, container: str) -> List[Quote]:
        """
        Get shipping quotes (Wraps REST logic).
        Container should be one of: '20ft', '40ft', '40ft_hc', 'lcl', 'air'
        """
        service = get_freight_engine()
        
        # Map simple container strings to Enum
        container_map = {
            "20ft": CargoType.FCL_20,
            "40ft": CargoType.FCL_40,
            "40HC": CargoType.FCL_40HC,
            "40ft_hc": CargoType.FCL_40HC,
            "lcl": CargoType.LCL,
            "air": CargoType.AIR
        }
        
        cargo_type = container_map.get(container, CargoType.FCL_20)
        
        req = QuoteRequest(
            origin=origin,
            destination=destination,
            cargo_type=cargo_type
        )
        
        # Reuse the robust logic from the service
        response = await service.get_quotes(req)
        
        # Map Pydantic models to Strawberry types
        return [
            Quote(
                id=q.id,
                carrier=q.carrier,
                carrier_logo=q.carrier_logo,
                price=q.price,
                currency=q.currency,
                ocean_freight=q.ocean_freight,
                surcharges=q.surcharges,
                insurance_cost=q.insurance_cost,
                transit_days=q.transit_days,
                valid_until=q.valid_until,
                route_details=q.route_details,
                is_real=q.is_real
            )
            for q in response.quotes
        ]

schema = strawberry.Schema(query=Query)
