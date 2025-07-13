#!/usr/bin/env python3
"""
Script pour importer des hadiths depuis l'API sunnah.com
"""

import sys
import os
from pathlib import Path
import requests
import time

# Ajouter le dossier parent au path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.hadith import Hadith, HadithCollection
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class HadithAPIImporter:
    def __init__(self):
        self.base_url = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1"
        self.session = None
        self.collections_map = {
            "bukhari": {"name": "Sahih Bukhari", "total": 7563},
            "muslim": {"name": "Sahih Muslim", "total": 7453},
            "abudawud": {"name": "Sunan Abu Dawud", "total": 5274},
            "tirmidhi": {"name": "Jami' at-Tirmidhi", "total": 3956},
            "nasai": {"name": "Sunan an-Nasa'i", "total": 5761},
            "ibnmajah": {"name": "Sunan Ibn Majah", "total": 4341}
        }
        
    def fetch_hadith(self, collection: str, number: int):
        """Récupérer un hadith spécifique"""
        try:
            # URLs pour l'arabe et l'anglais
            arabic_url = f"{self.base_url}/editions/ara-{collection}/{number}.json"
            english_url = f"{self.base_url}/editions/eng-{collection}/{number}.json"
            
            arabic_resp = requests.get(arabic_url)
            if arabic_resp.status_code == 200:
                arabic_data = arabic_resp.json()
            else:
                return None
                
            english_resp = requests.get(english_url)
            if english_resp.status_code == 200:
                english_data = english_resp.json()
            else:
                english_data = None
                
            return {
                "arabic": arabic_data,
                "english": english_data
            }
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du hadith {collection}:{number}: {str(e)}")
            return None
            
    def import_collection_hadiths(self, collection_id: str, limit: int = 50):
        """Importer des hadiths pour une collection"""
        db: Session = SessionLocal()
        
        try:
            # Vérifier que la collection existe
            collection = db.query(HadithCollection).filter(
                HadithCollection.collection_id == collection_id
            ).first()
            
            if not collection:
                logger.error(f"Collection {collection_id} non trouvée")
                return
                
            logger.info(f"Import des hadiths pour {collection.name}")
            
            # Compter les hadiths existants
            existing_count = db.query(Hadith).filter(
                Hadith.collection_id == collection.id
            ).count()
            
            logger.info(f"Hadiths existants: {existing_count}")
            
            imported = 0
            errors = 0
            
            # Commencer après les hadiths existants
            start = existing_count + 1
            end = min(start + limit, self.collections_map[collection_id]["total"])
            
            for i in range(start, end):
                hadith_data = self.fetch_hadith(collection_id, i)
                
                if not hadith_data or not hadith_data["arabic"]:
                    errors += 1
                    continue
                    
                try:
                    arabic = hadith_data["arabic"]["hadiths"][0]
                    english = hadith_data["english"]["hadiths"][0] if hadith_data["english"] else None
                    
                    # Extraire les données
                    arabic_text = arabic.get("text", "")
                    english_text = english.get("text", "") if english else ""
                    
                    # Extraire la chaîne de narration (isnad)
                    narrator_chain = ""
                    if "grades" in arabic:
                        narrator_chain = ", ".join([g.get("name", "") for g in arabic["grades"]])
                    
                    # Déterminer le grade
                    grade = "unknown"
                    if english and "grades" in english:
                        grades = [g.get("grade", "").lower() for g in english["grades"]]
                        if any("sahih" in g for g in grades):
                            grade = "sahih"
                        elif any("hasan" in g for g in grades):
                            grade = "hasan"
                        elif any("da'if" in g or "weak" in g for g in grades):
                            grade = "da'if"
                    
                    # Créer le hadith
                    new_hadith = Hadith(
                        collection_id=collection.id,
                        book_id=1,  # Par défaut
                        hadith_number=i,
                        arabic_text=arabic_text,
                        english_text=english_text,
                        narrator_chain=narrator_chain,
                        arabic_narrator_chain=narrator_chain,
                        grade=grade,
                        grade_text=grade.capitalize(),
                        reference=f"{collection.name} {i}"
                    )
                    
                    db.add(new_hadith)
                    imported += 1
                    
                    # Commit par lots de 10
                    if imported % 10 == 0:
                        db.commit()
                        logger.info(f"Importé {imported} hadiths...")
                        
                except Exception as e:
                    logger.error(f"Erreur lors de l'import du hadith {i}: {str(e)}")
                    errors += 1
                    db.rollback()
                    
                # Pause pour éviter de surcharger l'API
                time.sleep(0.5)
                
            # Commit final
            db.commit()
            logger.info(f"Import terminé: {imported} hadiths importés, {errors} erreurs")
            
        except Exception as e:
            logger.error(f"Erreur lors de l'import: {str(e)}")
            db.rollback()
        finally:
            db.close()

def main():
    """Fonction principale"""
    importer = HadithAPIImporter()
    
    # Importer 50 hadiths pour chaque collection
    for collection_id in ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"]:
        logger.info(f"\n--- Import de {collection_id} ---")
        importer.import_collection_hadiths(collection_id, limit=50)
        time.sleep(2)  # Pause entre les collections

if __name__ == "__main__":
    logger.info("Démarrage de l'import des hadiths depuis l'API")
    main()