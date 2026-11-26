
from app.database.supabase_client import supabase

try:
    response = supabase.table("farmers").select("*").limit(5).execute()

    print("SUPABASE CONNECTION SUCCESSFUL!")
    print("Farmers:", response.data)

except Exception as e:
    print("DATABASE ERROR:", e)
