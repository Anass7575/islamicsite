from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.api.deps import get_current_active_user
from app.db import get_db
from app.models import User, ZakatCalculation
from app.schemas import ZakatCalculationCreate, ZakatCalculationResponse

router = APIRouter()

class ZakatCalculateRequest(BaseModel):
    cash: float = 0.0
    gold_weight: float = 0.0
    silver_weight: float = 0.0
    investments: float = 0.0
    debts: float = 0.0

@router.post("/calculate")
def calculate_zakat(
    request: ZakatCalculateRequest
) -> Any:
    """Calculate zakat amount based on assets"""
    # Nisab values (as of 2025 - these should be updated regularly)
    gold_nisab_grams = 85  # 85 grams of gold
    silver_nisab_grams = 595  # 595 grams of silver
    
    # Approximate gold/silver prices (USD per gram)
    gold_price_per_gram = 65.0
    silver_price_per_gram = 0.80
    
    # Calculate nisab in currency
    gold_nisab_value = gold_nisab_grams * gold_price_per_gram
    silver_nisab_value = silver_nisab_grams * silver_price_per_gram
    
    # Use the lower nisab value (more conservative)
    nisab = min(gold_nisab_value, silver_nisab_value)
    
    # Calculate total wealth
    gold_value = request.gold_weight * gold_price_per_gram
    silver_value = request.silver_weight * silver_price_per_gram
    total_wealth = request.cash + gold_value + silver_value + request.investments - request.debts
    
    # Check if zakat is due
    if total_wealth < nisab:
        return {
            "is_due": False,
            "total_wealth": total_wealth,
            "nisab": nisab,
            "zakat_amount": 0.0,
            "breakdown": {
                "cash": request.cash,
                "gold_value": gold_value,
                "silver_value": silver_value,
                "investments": request.investments,
                "debts": request.debts
            }
        }
    
    # Calculate zakat (2.5% of wealth above nisab)
    zakat_amount = total_wealth * 0.025
    
    return {
        "is_due": True,
        "total_wealth": total_wealth,
        "nisab": nisab,
        "zakat_amount": round(zakat_amount, 2),
        "breakdown": {
            "cash": request.cash,
            "gold_value": gold_value,
            "silver_value": silver_value,
            "investments": request.investments,
            "debts": request.debts
        }
    }

@router.post("/calculations", response_model=ZakatCalculationResponse)
def save_zakat_calculation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    calculation_in: ZakatCalculationCreate
) -> Any:
    """Save a zakat calculation"""
    calculation = ZakatCalculation(
        **calculation_in.dict(),
        user_id=current_user.id
    )
    db.add(calculation)
    db.commit()
    db.refresh(calculation)
    
    return calculation

@router.get("/history", response_model=List[ZakatCalculationResponse])
def get_zakat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get user's zakat calculation history"""
    calculations = db.query(ZakatCalculation).filter(
        ZakatCalculation.user_id == current_user.id
    ).order_by(ZakatCalculation.calculated_at.desc()).offset(skip).limit(limit).all()
    
    return calculations

@router.get("/calculations/{calculation_id}", response_model=ZakatCalculationResponse)
def get_zakat_calculation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    calculation_id: int
) -> Any:
    """Get specific zakat calculation"""
    calculation = db.query(ZakatCalculation).filter(
        ZakatCalculation.id == calculation_id,
        ZakatCalculation.user_id == current_user.id
    ).first()
    
    if not calculation:
        raise HTTPException(
            status_code=404,
            detail="Calculation not found"
        )
    
    return calculation