#!/usr/bin/env python3
"""
Script pour classer les hadiths par livre et par thèmes
"""
import sys
import os
from pathlib import Path
from collections import defaultdict
import json

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.db import SessionLocal
from app.models.hadith import Hadith, HadithCollection, HadithBook
from sqlalchemy import func, distinct

# Thèmes et mots-clés associés
THEMES = {
    "Foi et Croyance": ["faith", "belief", "iman", "tawhid", "allah", "prophet", "messenger", "islam", "muslim", "believer", "worship", "lord", "creator"],
    "Prière": ["prayer", "salah", "salat", "pray", "mosque", "wudu", "ablution", "qiblah", "imam", "congregation", "prostration", "bowing"],
    "Jeûne": ["fast", "fasting", "ramadan", "sawm", "siyam", "iftar", "suhur", "suhoor", "month", "hunger", "thirst"],
    "Zakat et Charité": ["zakat", "charity", "sadaqah", "poor", "needy", "wealth", "give", "donation", "alms", "spending"],
    "Pèlerinage": ["hajj", "pilgrimage", "umrah", "mecca", "kaaba", "ihram", "tawaf", "arafah", "mina", "medina"],
    "Éthique et Comportement": ["character", "manner", "behavior", "ethics", "moral", "kindness", "honest", "truthful", "patient", "forgive", "mercy"],
    "Famille et Mariage": ["marriage", "wife", "husband", "children", "family", "parent", "mother", "father", "divorce", "wedding"],
    "Commerce et Transactions": ["trade", "business", "transaction", "buy", "sell", "commerce", "money", "debt", "loan", "contract"],
    "Science et Connaissance": ["knowledge", "learn", "teach", "scholar", "wisdom", "study", "book", "read", "understand", "education"],
    "Invocations et Dhikr": ["supplication", "dua", "prayer", "invocation", "dhikr", "remember", "praise", "glorify", "seek", "ask"],
    "Paradis et Enfer": ["paradise", "jannah", "heaven", "hell", "jahannam", "fire", "reward", "punishment", "hereafter", "afterlife"],
    "Prophètes et Compagnons": ["prophet", "messenger", "companion", "sahaba", "abraham", "moses", "jesus", "noah", "adam"],
    "Jihad et Lutte": ["jihad", "struggle", "fight", "battle", "war", "enemy", "victory", "martyr", "defend"],
    "Alimentation": ["food", "eat", "drink", "halal", "haram", "meat", "water", "honey", "dates", "milk"],
    "Médecine et Santé": ["medicine", "health", "sick", "cure", "disease", "heal", "doctor", "remedy", "treatment"],
    "Mort et Funérailles": ["death", "die", "funeral", "grave", "bury", "deceased", "mourn", "cemetery"],
    "Signes de la Fin": ["hour", "signs", "dajjal", "mahdi", "judgment", "resurrection", "end times", "apocalypse"],
    "Rêves": ["dream", "vision", "sleep", "interpretation", "nightmare"],
    "Animaux": ["animal", "dog", "cat", "horse", "camel", "bird", "sheep", "cattle"],
    "Vêtements et Apparence": ["dress", "clothes", "wear", "garment", "beard", "hair", "appearance", "modest"]
}

def classify_hadith_by_theme(hadith_text):
    """Classifie un hadith selon les thèmes basés sur les mots-clés"""
    text_lower = hadith_text.lower() if hadith_text else ""
    themes_found = []
    
    for theme, keywords in THEMES.items():
        for keyword in keywords:
            if keyword in text_lower:
                themes_found.append(theme)
                break
    
    # Si aucun thème trouvé, assigner "Divers"
    if not themes_found:
        themes_found.append("Divers")
    
    return themes_found

def analyze_hadiths():
    """Analyse et classe tous les hadiths"""
    db = SessionLocal()
    
    print("=" * 80)
    print("CLASSIFICATION DES HADITHS PAR LIVRE ET PAR THÈMES")
    print("=" * 80)
    
    # Statistiques par collection
    print("\n📚 HADITHS PAR COLLECTION ET PAR LIVRE:")
    print("-" * 60)
    
    total_all = 0
    books_data = defaultdict(lambda: defaultdict(int))
    themes_data = defaultdict(int)
    collection_themes = defaultdict(lambda: defaultdict(int))
    
    for collection in db.query(HadithCollection).order_by(HadithCollection.id).all():
        print(f"\n{collection.name} ({collection.collection_id}):")
        
        # Récupérer tous les livres de cette collection
        books = db.query(HadithBook).filter(
            HadithBook.collection_id == collection.id
        ).order_by(HadithBook.book_number).all()
        
        collection_total = 0
        
        for book in books:
            # Compter les hadiths par livre
            count = db.query(func.count(Hadith.id)).filter(
                Hadith.book_id == book.id
            ).scalar()
            
            if count > 0:
                print(f"  📖 Livre {book.book_number}: {book.name[:50]:<50} {count:>5} hadiths")
                books_data[collection.name][book.book_number] = {
                    'name': book.name,
                    'count': count
                }
                collection_total += count
                
                # Analyser les thèmes pour ce livre
                hadiths = db.query(Hadith).filter(Hadith.book_id == book.id).all()
                for hadith in hadiths:
                    themes = classify_hadith_by_theme(hadith.english_text)
                    for theme in themes:
                        themes_data[theme] += 1
                        collection_themes[collection.name][theme] += 1
        
        print(f"  {'─' * 58}")
        print(f"  Total pour {collection.name}: {collection_total} hadiths")
        total_all += collection_total
    
    print(f"\n{'=' * 60}")
    print(f"TOTAL GÉNÉRAL: {total_all} hadiths")
    
    # Statistiques par thème
    print("\n\n🏷️  HADITHS PAR THÈME (tous collections confondues):")
    print("-" * 60)
    
    # Trier par nombre décroissant
    sorted_themes = sorted(themes_data.items(), key=lambda x: x[1], reverse=True)
    
    for theme, count in sorted_themes:
        percentage = (count / total_all * 100) if total_all > 0 else 0
        bar_length = int(percentage / 2)  # Pour faire une barre de 50 caractères max
        bar = "█" * bar_length
        print(f"{theme:30} {count:>6} ({percentage:>5.1f}%) {bar}")
    
    # Top thèmes par collection
    print("\n\n📊 TOP 5 THÈMES PAR COLLECTION:")
    print("-" * 60)
    
    for collection_name, themes in collection_themes.items():
        print(f"\n{collection_name}:")
        sorted_collection_themes = sorted(themes.items(), key=lambda x: x[1], reverse=True)[:5]
        for i, (theme, count) in enumerate(sorted_collection_themes, 1):
            print(f"  {i}. {theme}: {count} hadiths")
    
    # Exporter les données en JSON pour utilisation future
    export_data = {
        'total_hadiths': total_all,
        'collections': {},
        'themes': dict(themes_data),
        'collection_themes': dict(collection_themes)
    }
    
    for collection_name, books in books_data.items():
        export_data['collections'][collection_name] = {
            'books': dict(books),
            'total': sum(book['count'] for book in books.values())
        }
    
    with open('hadith_classification.json', 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print("\n\n✅ Données exportées dans 'hadith_classification.json'")
    
    # Suggestions d'amélioration
    print("\n\n💡 SUGGESTIONS D'AMÉLIORATION:")
    print("-" * 60)
    
    # Thèmes peu représentés
    underrepresented = [theme for theme, count in sorted_themes if count < total_all * 0.01]
    if underrepresented:
        print(f"Thèmes peu représentés (<1%): {', '.join(underrepresented[:5])}")
    
    # Hadiths non classifiés
    divers_count = themes_data.get("Divers", 0)
    if divers_count > 0:
        divers_percentage = (divers_count / total_all * 100)
        print(f"Hadiths non classifiés: {divers_count} ({divers_percentage:.1f}%)")
        print("→ Considérer l'ajout de nouveaux thèmes ou mots-clés")
    
    db.close()

if __name__ == "__main__":
    analyze_hadiths()