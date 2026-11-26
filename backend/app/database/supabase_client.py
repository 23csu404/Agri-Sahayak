
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

# Locate backend directory
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Load .env from backend folder
load_dotenv(BACKEND_DIR / ".env")
print("ENV PATH:", BACKEND_DIR / ".env")
print("ENV EXISTS:", (BACKEND_DIR / ".env").exists())
print("URL LOADED:", bool(os.getenv("SUPABASE_URL")))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
)
print("KEY TYPE:", SUPABASE_KEY[:12])
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials missing in backend/.env")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

print("Supabase client initialized!")
