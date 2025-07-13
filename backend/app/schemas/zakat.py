from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict

class ZakatCalculationBase(BaseModel):
    total_assets: float
    total_debts: float = 0
    net_assets: float
    zakat_amount: float
    calculation_type: str = "annual"
    asset_breakdown: Optional[Dict[str, float]] = None
    currency: str = "USD"

class ZakatCalculationCreate(ZakatCalculationBase):
    pass

class ZakatCalculationResponse(ZakatCalculationBase):
    id: int
    user_id: int
    calculated_at: datetime
    
    class Config:
        from_attributes = True