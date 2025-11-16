import os, re, time, json, requests, traceback
from typing import List
from django.utils.timezone import localdate
from rest_framework.views import APIView
from rest_framework.response import Response
from api.llama.llama_holidays_prompts import _llama_extract
from api.services.culinary_holidays_llama_service import _kalbi_url, _fetch_html, _between, _to_plain_snippet

CACHE = {"date": None, "items": [], "src": "", "ts": 0.0}
TTL = 24 * 3600

class FoodHolidayTodayView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        today = localdate()
        iso = today.isoformat()

        if CACHE["date"] == iso and time.time() - CACHE["ts"] < TTL:
            return Response({"date": iso, "holidays": CACHE["items"], "sources": [CACHE["src"]]})

        url = _kalbi_url(today)
        holidays: List[str] = []

        try:
            html = _fetch_html(url)
            block = _between(html, "Nietypowe święta:", "Przysłowia") or html
            snippet = _to_plain_snippet(block, max_chars=1200)
            holidays = _llama_extract(url, iso, snippet)
        except Exception:
            print("[food-holiday] error:\n" + traceback.format_exc())
            holidays = []

        CACHE.update({"date": iso, "items": holidays, "src": url, "ts": time.time()})
        return Response({"date": iso, "holidays": holidays, "sources": [url]})
