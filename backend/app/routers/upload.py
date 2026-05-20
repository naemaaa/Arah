from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.cv_parser import parse_cv

router = APIRouter()

@router.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya file PDF yang diterima")
    
    file_bytes = await file.read()
    
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File terlalu besar, maksimal 5MB")
    
    extracted_text = parse_cv(file_bytes)
    
    if not extracted_text:
        raise HTTPException(status_code=422, detail="Gagal mengekstrak teks dari PDF")
    
    return {
        "status": "success",
        "extracted_text": extracted_text,
        "char_count": len(extracted_text)
    }