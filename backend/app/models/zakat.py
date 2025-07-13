from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class ZakatCalculation(Base):
    __tablename__ = "zakat_calculations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_assets = Column(Float, nullable=False)
    total_debts = Column(Float, default=0)
    net_assets = Column(Float, nullable=False)
    zakat_amount = Column(Float, nullable=False)
    calculation_type = Column(String, default="annual")  # annual, gold, silver, business
    asset_breakdown = Column(JSON)  # Store detailed breakdown
    currency = Column(String, default="USD")
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="zakat_calculations")