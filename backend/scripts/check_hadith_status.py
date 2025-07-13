#!/usr/bin/env python3
"""
Script pour vérifier l'état actuel des hadiths dans la base de données
"""

import sys
import os
from pathlib import Path

# Ajouter le dossier parent au path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.hadith import Hadith, HadithCollection, HadithBook, HadithCategory, HadithNote
from sqlalchemy import func
import json

def check_hadith_status():
    """Vérifier l'état actuel de la base de données des hadiths"""
    db: Session = SessionLocal()
    
    try:
        print("=== ÉTAT ACTUEL DE LA SECTION HADITHS ===\n")
        
        # 1. Collections
        print("1. COLLECTIONS:")
        collections = db.query(HadithCollection).all()
        if collections:
            for collection in collections:
                hadith_count = db.query(Hadith).filter(
                    Hadith.collection_id == collection.id
                ).count()
                print(f"   - {collection.name} ({collection.collection_id})")
                print(f"     Hadiths: {hadith_count} / {collection.total_hadiths}")
                print(f"     Livres: {collection.books}")
        else:
            print("   Aucune collection trouvée dans la base de données")
        
        # 2. Livres
        print("\n2. LIVRES (BOOKS):")
        books_count = db.query(HadithBook).count()
        print(f"   Total des livres: {books_count}")
        if books_count > 0:
            # Afficher quelques exemples
            sample_books = db.query(HadithBook).limit(5).all()
            for book in sample_books:
                print(f"   - {book.name} (Collection ID: {book.collection_id}, Book #{book.book_number})")
        
        # 3. Hadiths
        print("\n3. HADITHS:")
        total_hadiths = db.query(Hadith).count()
        print(f"   Total des hadiths: {total_hadiths}")
        
        # Statistiques par grade
        grades = db.query(
            Hadith.grade, 
            func.count(Hadith.id)
        ).group_by(Hadith.grade).all()
        
        if grades:
            print("   Répartition par grade:")
            for grade, count in grades:
                print(f"     - {grade or 'Non spécifié'}: {count}")
        
        # Hadiths avec texte français
        french_count = db.query(Hadith).filter(
            Hadith.french_text != None,
            Hadith.french_text != ""
        ).count()
        print(f"   Hadiths avec traduction française: {french_count}")
        
        # 4. Catégories
        print("\n4. CATÉGORIES:")
        categories = db.query(HadithCategory).all()
        if categories:
            print(f"   Total des catégories: {len(categories)}")
            for category in categories[:5]:  # Afficher les 5 premières
                print(f"   - {category.name} ({category.category_id})")
        else:
            print("   Aucune catégorie trouvée")
        
        # 5. Notes
        print("\n5. NOTES D'UTILISATEURS:")
        notes_count = db.query(HadithNote).count()
        print(f"   Total des notes: {notes_count}")
        
        # 6. Fonctionnalités implémentées
        print("\n6. FONCTIONNALITÉS IMPLÉMENTÉES:")
        print("   ✓ Modèles de données (Collections, Books, Hadiths, Categories, Notes)")
        print("   ✓ API endpoints pour:")
        print("     - Lister les collections")
        print("     - Récupérer les hadiths par collection")
        print("     - Recherche de hadiths")
        print("     - Pagination")
        print("     - Filtrage par livre, grade")
        print("     - Catégories de hadiths")
        print("     - Notes personnelles")
        print("     - Import depuis API externe")
        print("     - Support audio (TTS)")
        
        # 7. Fonctionnalités manquantes
        print("\n7. FONCTIONNALITÉS MANQUANTES OU À AMÉLIORER:")
        print("   ❌ Traductions françaises (actuellement vides)")
        print("   ❌ Import complet des données (seulement quelques hadiths importés)")
        print("   ❌ Chapitres détaillés dans les livres")
        print("   ❌ Système de favoris pour les utilisateurs")
        print("   ❌ Partage de hadiths")
        print("   ❌ Export PDF/Word")
        print("   ❌ Statistiques avancées pour les utilisateurs")
        print("   ❌ Système de tags personnalisés")
        print("   ❌ Historique de lecture")
        print("   ❌ Recommandations basées sur l'historique")
        
        # 8. État des imports
        print("\n8. ÉTAT DES IMPORTS:")
        for collection in collections:
            hadith_count = db.query(Hadith).filter(
                Hadith.collection_id == collection.id
            ).count()
            percentage = (hadith_count / collection.total_hadiths * 100) if collection.total_hadiths > 0 else 0
            print(f"   - {collection.name}: {percentage:.1f}% importé")
        
    except Exception as e:
        print(f"Erreur lors de la vérification: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    check_hadith_status()