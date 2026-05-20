import pdfplumber
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def clean_cv_text(text: str) -> str:
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        line = line.strip()
        if len(line) > 2:
            cleaned.append(line)
    return "\n".join(cleaned)

def parse_cv(file_bytes: bytes) -> str:
    raw_text = extract_text_from_pdf(file_bytes)
    return clean_cv_text(raw_text)