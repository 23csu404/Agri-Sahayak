
from supabase import create_client, Client
from backend.app.core.config import settings

supabase: Client | None = None


def get_supabase() -> Client:

    global supabase

    if supabase is None:

        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise RuntimeError(
                "Supabase credentials are missing. "
                "Configure backend/.env first."
            )

        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

    return supabase
