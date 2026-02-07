from abc import ABC, abstractmethod
from typing import List
from app.schemas import OceanQuote, RateRequest

class OceanCarrierProtocol(ABC):
    """
    Standard Interface for Real Ocean Container Carriers.
    Ensures Maersk and CMA CGM implement the exact same 'Container' logic.
    """
    
    @abstractmethod
    async def fetch_real_rates(self, request: RateRequest) -> List[OceanQuote]:
        """
        Connects to the Carrier's Live API to fetch spot rates.
        MUST raise an exception or return empty list if Auth fails.
        NO FAKE DATA allowed.
        """
        pass
    
    @abstractmethod
    async def check_connection(self) -> bool:
        """
        Pings the API with the provided credentials to verify access.
        """
        pass
