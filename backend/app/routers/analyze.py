from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.graph import arah_graph

router = APIRouter()

class FormInput(BaseModel):
    major: str
    target_role: str
    level: str = "junior"
    self_described_skills: str
    job_desc: str = ""

class CVInput(BaseModel):
    major: str
    target_role: str
    level: str = "junior"
    extracted_text: str
    job_desc: str = ""

@router.post("/analyze/form")
async def analyze_from_form(data: FormInput):
    try:
        result = arah_graph.invoke({
            "major": data.major,
            "target_role": data.target_role,
            "level": data.level,
            "raw_text": data.self_described_skills,
            "input_type": "form",
            "job_desc": data.job_desc,
            "user_skills": [],
            "gap_result": {},
            "roadmap_result": {}
        })
        return {
            "status": "success",
            "user_skills": result["user_skills"],
            "gap": result["gap_result"],
            "roadmap": result["roadmap_result"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/cv")
async def analyze_from_cv(data: CVInput):
    try:
        result = arah_graph.invoke({
            "major": data.major,
            "target_role": data.target_role,
            "level": data.level,
            "raw_text": data.extracted_text,
            "input_type": "cv",
            "job_desc": data.job_desc,
            "user_skills": [],
            "gap_result": {},
            "roadmap_result": {}
        })
        return {
            "status": "success",
            "user_skills": result["user_skills"],
            "gap": result["gap_result"],
            "roadmap": result["roadmap_result"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))