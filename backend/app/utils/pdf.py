from __future__ import annotations

import fitz

from app.utils.text import normalize_text


def extract_text_from_pdf(file_bytes: bytes) -> str:
    with fitz.open(stream=file_bytes, filetype="pdf") as document:
        pages = [page.get_text("text") for page in document]
    return normalize_text("\n".join(pages))
