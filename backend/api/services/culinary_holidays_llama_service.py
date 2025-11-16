import random, time, re, requests
from requests.adapters import HTTPAdapter, Retry

BASE = "https://www.kalbi.pl"
MONTH_SLUG = ["stycznia","lutego","marca","kwietnia","maja","czerwca",
              "lipca","sierpnia","wrzesnia","pazdziernika","listopada","grudnia"]
HEADERS = {"User-Agent": "Mozilla/5.0", "Accept-Language": "pl,en;q=0.8"}
TIMEOUT_HTML = 8

_s = requests.Session()
_s.headers.update(HEADERS)
_s.mount("https://", HTTPAdapter(max_retries=Retry(
    total=2, backoff_factor=0.3,
    status_forcelist=(429, 500, 502, 503, 504),
    allowed_methods=frozenset(["GET"])
)))

def _kalbi_url(d): return f"{BASE}/{d.day}-{MONTH_SLUG[d.month - 1]}"

def _fetch_html(url: str) -> str:
    r = _s.get(url, timeout=TIMEOUT_HTML)
    r.raise_for_status()
    return r.text

def _between(text: str, start_marker: str, end_marker: str) -> str:
    i = text.find(start_marker)
    if i == -1: return ""
    i += len(start_marker)
    j = text.find(end_marker, i)
    if j == -1: j = len(text)
    return text[i:j]

def _to_plain_snippet(html_block: str, max_chars: int = 1200) -> str:
    h = re.sub(r"(?is)<script.*?>.*?</script>", " ", html_block)
    h = re.sub(r"(?is)<style.*?>.*?</style>", " ", h)
    h = re.sub(r"(?is)<[^>]+>", "\n", h)
    lines = [re.sub(r"\s+", " ", s).strip(" .•-\t") for s in h.split("\n")]
    lines = [ln for ln in lines if ln]
    text = "\n".join(lines)
    return text[:max_chars]