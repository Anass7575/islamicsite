"""
Hadith export service for PDF and Word formats
"""
from typing import List, Optional
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
import arabic_reshaper
from bidi.algorithm import get_display

from sqlalchemy.orm import Session
from app.models.hadith import Hadith, HadithCollection
import logging

logger = logging.getLogger(__name__)


class HadithExporter:
    def __init__(self):
        # Register Arabic font if available
        try:
            # You'll need to add an Arabic font file to support Arabic text
            # pdfmetrics.registerFont(TTFont('Arabic', '/path/to/arabic/font.ttf'))
            pass
        except:
            logger.warning("Arabic font not registered, using default font")
        
        self.styles = getSampleStyleSheet()
        self._setup_styles()
    
    def _setup_styles(self):
        """Setup custom styles for the PDF"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#059669'),  # Islamic green
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        # Arabic style
        self.styles.add(ParagraphStyle(
            name='Arabic',
            parent=self.styles['Normal'],
            fontSize=16,
            rightIndent=0,
            leftIndent=0,
            alignment=TA_RIGHT,
            wordWrap='RTL',
            spaceAfter=12
        ))
        
        # English style
        self.styles.add(ParagraphStyle(
            name='English',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            textColor=colors.HexColor('#374151')
        ))
        
        # Metadata style
        self.styles.add(ParagraphStyle(
            name='Metadata',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6B7280'),
            spaceAfter=6
        ))
    
    def export_hadith_to_pdf(
        self, 
        hadiths: List[Hadith], 
        collection_name: str,
        include_arabic: bool = True,
        include_english: bool = True,
        include_metadata: bool = True
    ) -> BytesIO:
        """Export hadiths to PDF format"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Title
        title = Paragraph(f"<b>{collection_name}</b>", self.styles['CustomTitle'])
        story.append(title)
        story.append(Spacer(1, 0.5*inch))
        
        # Add each hadith
        for i, hadith in enumerate(hadiths):
            # Hadith number and reference
            ref_text = f"<b>Hadith {hadith.hadith_number}</b> - {hadith.reference}"
            ref_para = Paragraph(ref_text, self.styles['Metadata'])
            story.append(ref_para)
            
            # Arabic text
            if include_arabic and hadith.arabic_text:
                # Reshape Arabic text for proper display
                reshaped_text = arabic_reshaper.reshape(hadith.arabic_text)
                bidi_text = get_display(reshaped_text)
                arabic_para = Paragraph(bidi_text, self.styles['Arabic'])
                story.append(arabic_para)
            
            # English text
            if include_english and hadith.english_text:
                english_para = Paragraph(hadith.english_text, self.styles['English'])
                story.append(english_para)
            
            # Metadata
            if include_metadata:
                metadata_parts = []
                if hadith.narrator_chain:
                    metadata_parts.append(f"Narrator: {hadith.narrator_chain}")
                if hadith.grade_text:
                    metadata_parts.append(f"Grade: {hadith.grade_text}")
                
                if metadata_parts:
                    metadata_text = " | ".join(metadata_parts)
                    metadata_para = Paragraph(metadata_text, self.styles['Metadata'])
                    story.append(metadata_para)
            
            # Separator
            story.append(Spacer(1, 0.3*inch))
            
            # Add horizontal line
            line_data = [['_' * 80]]
            line_table = Table(line_data, colWidths=[6.5*inch])
            line_table.setStyle(TableStyle([
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#E5E7EB')),
                ('FONTSIZE', (0, 0), (-1, -1), 1),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            story.append(line_table)
            story.append(Spacer(1, 0.3*inch))
            
            # Page break every 3 hadiths for readability
            if (i + 1) % 3 == 0 and i < len(hadiths) - 1:
                story.append(PageBreak())
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def export_single_hadith(
        self,
        hadith: Hadith,
        collection_name: str
    ) -> BytesIO:
        """Export a single hadith to PDF"""
        return self.export_hadith_to_pdf([hadith], collection_name)


def export_hadiths_to_pdf(
    db: Session,
    collection_id: Optional[int] = None,
    hadith_ids: Optional[List[int]] = None,
    limit: int = 100
) -> BytesIO:
    """Export hadiths to PDF based on filters"""
    query = db.query(Hadith)
    
    if collection_id:
        query = query.filter(Hadith.collection_id == collection_id)
    
    if hadith_ids:
        query = query.filter(Hadith.id.in_(hadith_ids))
    
    hadiths = query.limit(limit).all()
    
    # Get collection name
    collection_name = "Hadith Collection"
    if collection_id and hadiths:
        collection = db.query(HadithCollection).filter(
            HadithCollection.id == collection_id
        ).first()
        if collection:
            collection_name = collection.name
    
    exporter = HadithExporter()
    return exporter.export_hadith_to_pdf(hadiths, collection_name)