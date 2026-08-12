import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# Chargement des variables d'environnement
load_dotenv()

# Configuration du modèle
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

app = FastAPI(title="Geo-Globe AI Core", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandRequest(BaseModel):
    prompt: str
    target_iso: str = None

# ==========================================
# BOÎTE À OUTILS (TOOLS)
# ==========================================
# Note : Les docstrings ("""...""") sont lues par l'IA. 
# Elles DOIVENT être précises pour que le modèle sache quand utiliser l'outil.

def search_osint(query: str) -> dict:
    """Effectue une recherche sur le web (OSINT) pour trouver des informations récentes, des actualités ou des données géopolitiques non structurées."""
    print(f"\n[🤖 L'IA EXECUTE UN OUTIL] > search_osint('{query}')")
    # Simulation d'un retour web en attendant la vraie API
    return {"source": "web", "content": f"Résultats web simulés pour : {query}"}

def query_database(iso_code: str) -> dict:
    """Interroge la base de données interne PostgreSQL pour récupérer les statistiques exactes d'un pays (population, PIB, ressources, alliances). Utiliser le code ISO."""
    print(f"\n[🤖 L'IA EXECUTE UN OUTIL] > query_database('{iso_code}')")
    # Simulation d'un retour base de données en attendant Prisma/PostgreSQL
    return {"source": "database", "iso": iso_code, "population_millions": 67, "gdp_billions": 2000, "status": "Stable"}

# Initialisation du modèle en lui passant nos outils
model = genai.GenerativeModel(
    model_name='gemini-1.5-flash',
    tools=[search_osint, query_database]
)

# ==========================================
# CŒUR DE RAISONNEMENT (ENDPOINT)
# ==========================================

@app.post("/api/analyze")
async def analyze_command(request: CommandRequest):
    print(f"\n[*] Nouvelle directive reçue : '{request.prompt}'")
    
    # On démarre une session de chat pour conserver le contexte si besoin
    # enable_automatic_function_calling=True permet au SDK de gérer l'aller-retour
    # (le modèle demande l'outil -> le SDK l'exécute -> le SDK renvoie le résultat au modèle)
    chat = model.start_chat(enable_automatic_function_calling=True)
    
    try:
        # On envoie la requête à l'IA
        response = chat.send_message(request.prompt)
        
        # On extrait l'historique pour voir si des outils ont été appelés
        tools_used = []
        for message in chat.history:
            if message.parts:
                for part in message.parts:
                    if part.function_call:
                        tools_used.append(part.function_call.name)
        
        return {
            "status": "SUCCESS",
            "response": response.text,
            "tools_used": tools_used
        }
        
    except Exception as e:
        print(f"[ERREUR] {str(e)}")
        return {"status": "ERROR", "message": str(e)}