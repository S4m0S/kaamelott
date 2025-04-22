import json
import os
import unicodedata

def normalize_text(text):
    """Normalise le texte pour le matching"""
    # Enlève les accents et caractères spéciaux
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ASCII', 'ignore').decode('ASCII')
    
    # Garde seulement les caractères alphanumériques et convertit en minuscules
    text = ''.join(c if c.isalnum() else ' ' for c in text)
    text = text.lower().strip()
    
    # Remplace les espaces multiples par des underscores
    text = '_'.join(text.split())
    
    # Prend les 15 premiers caractères
    return text[:15]

def generate_mapping(quotes_path, sounds_dir, output_path):
    # Charger les citations
    with open(quotes_path, 'r', encoding='utf-8') as f:
        quotes = json.load(f)
    
    # Lister les fichiers audio
    audio_files = [f for f in os.listdir(sounds_dir) if f.endswith('.mp3')]
    
    # Préparer le mapping
    mapping = []
    matched_files = set()
    
    for quote in quotes:
        quote_text = quote['quote']
        normalized_quote = normalize_text(quote_text)
        
        best_match = None
        best_score = 0
        
        for audio_file in audio_files:
            # Normaliser le nom du fichier audio
            base_name = os.path.splitext(audio_file)[0]
            normalized_audio = normalize_text(base_name)
            
            # Calculer le score de correspondance
            score = 0
            if normalized_audio in normalized_quote:
                score = len(normalized_audio)
            elif normalized_quote in normalized_audio:
                score = len(normalized_quote)
                
            if score > best_score:
                best_score = score
                best_match = audio_file
                
        if best_match:
            mapping.append({
                "quote_id": quote.get('id', len(mapping)),
                "quote_text": quote_text,
                "audio_file": best_match,
                "match_type": "auto",
                "match_score": best_score
            })
            matched_files.add(best_match)
        else:
            mapping.append({
                "quote_id": quote.get('id', len(mapping)),
                "quote_text": quote_text,
                "audio_file": None,
                "match_type": "none",
                "match_score": 0
            })
    
    # Sauvegarder le mapping
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    
    # Générer un rapport
    total_quotes = len(quotes)
    matched_quotes = len([m for m in mapping if m['audio_file']])
    unused_audio = set(audio_files) - matched_files
    
    print(f"Statistiques:")
    print(f"- Citations traitées: {total_quotes}")
    print(f"- Citations matchées: {matched_quotes} ({matched_quotes/total_quotes:.1%})")
    print(f"- Fichiers audio non utilisés: {len(unused_audio)}")
    
    if unused_audio:
        print("\nFichiers audio non associés:")
        for f in sorted(unused_audio):
            print(f"  - {f}")

# Utilisation
generate_mapping(
    quotes_path='quotes.json',
    sounds_dir='sounds',
    output_path='audio_mapping.json'
)