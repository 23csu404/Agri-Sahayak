
from backend.app.database.supabase import get_supabase

try:
    db = get_supabase()

    print("SUCCESS: Supabase client initialized!")

    # Check that the database API is reachable
    response = db.table("farmers").select("*").limit(1).execute()

    print("SUCCESS: Database API responding!")
    print("Response:", response.data)

except Exception as e:
    print("SUPABASE CONNECTION ERROR:")
    print(e)
