import httpx

from app.core.config import settings


async def trigger_n8n(webhook_url: str, payload: dict) -> dict:
    headers = {}
    if settings.N8N_WEBHOOK_SECRET:
        headers["X-N8N-Secret"] = settings.N8N_WEBHOOK_SECRET

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(webhook_url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json() if response.content else {}


async def notify_appointment_confirmed(payload: dict) -> bool:
    if not settings.N8N_APPOINTMENT_CONFIRMED_WEBHOOK_URL:
        return False
    try:
        await trigger_n8n(settings.N8N_APPOINTMENT_CONFIRMED_WEBHOOK_URL, payload)
        return True
    except httpx.HTTPError:
        return False
