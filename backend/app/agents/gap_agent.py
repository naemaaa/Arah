import json
from pathlib import Path
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile"
)

DATA_PATH = Path(__file__).parent.parent / "data"

def load_jobs():
    with open(DATA_PATH / "all_jobs_fixed.json") as f:
        return json.load(f)

def extract_skills_from_job_desc(job_desc: str) -> list[str]:
    prompt = f"""
Kamu adalah skill extractor. Ekstrak semua skill teknis dan non-teknis dari job description berikut.

Job Description:
{job_desc}

Kembalikan HANYA JSON array of strings. Contoh: ["Python", "SQL", "Communication"]
Jangan tambahkan penjelasan apapun.
"""
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        raw = response.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1].replace("json", "").strip()
        return json.loads(raw)
    except:
        return []

def get_required_skills_from_data(target_role: str, level: str = "junior") -> list[str]:
    jobs = load_jobs()
    matched = [
        j for j in jobs
        if j["role"].lower() == target_role.lower()
        and j["level"].lower() == level.lower()
    ]
    if not matched:
        matched = [j for j in jobs if j["role"].lower() == target_role.lower()]

    skill_count = {}
    for job in matched:
        for skill in job.get("skills_required", []):
            skill_count[skill] = skill_count.get(skill, 0) + 1

    sorted_skills = sorted(skill_count.items(), key=lambda x: x[1], reverse=True)
    return [skill for skill, _ in sorted_skills]

def generate_skills_from_llm(target_role: str, level: str = "junior") -> list[str]:
    prompt = f"""
Kamu adalah pakar karir IT. Tentukan daftar 10 skill (teknis dan non-teknis) yang paling penting dan wajib dikuasai untuk pekerjaan:
Role: {target_role}
Level: {level}

Kembalikan HANYA JSON array of strings. Contoh: ["React", "CSS", "UI Design"]
Jangan tambahkan penjelasan apapun.
"""
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1].replace("json", "").strip()
        return json.loads(raw)
    except:
        return []

def analyze_gap(
    user_skills: list[str],
    target_role: str,
    level: str = "junior",
    job_desc: str = ""
) -> dict:
    if job_desc and len(job_desc.strip()) > 50:
        required_skills = extract_skills_from_job_desc(job_desc)
        source = "job_description"
    else:
        required_skills = get_required_skills_from_data(target_role, level)
        source = "database"
        if not required_skills:
            required_skills = generate_skills_from_llm(target_role, level)
            source = "llm_fallback"

    user_skills_lower = [s.lower() for s in user_skills]

    matched = []
    missing = []

    for skill in required_skills:
        if skill.lower() in user_skills_lower:
            matched.append(skill)
        else:
            missing.append(skill)

    TRANSFERABLE_MAP = {
        "Communication": ["Product Manager", "Business Analyst", "UX Researcher", "Data Analyst"],
        "Excel": ["Data Analyst", "Business Analyst", "Data Scientist"],
        "Agile": ["Product Manager", "Backend Developer", "Frontend Developer"],
        "SQL": ["Data Analyst", "Data Scientist", "Backend Developer"],
        "Python": ["Data Analyst", "Data Scientist", "Backend Developer"],
        "Git": ["Backend Developer", "Frontend Developer", "Mobile Developer"],
        "Scrum": ["Product Manager", "Backend Developer", "Frontend Developer"],
        "Statistics": ["Data Scientist", "Data Analyst"],
        "Critical Thinking": ["Business Analyst", "Product Manager", "Data Analyst"],
        "Project Management": ["Product Manager", "Business Analyst"],
    }

    transferable = []
    for skill in user_skills:
        if skill not in matched:
            related_roles = TRANSFERABLE_MAP.get(skill, [])
            if any(target_role.lower() in r.lower() for r in related_roles):
                transferable.append({
                    "skill": skill,
                    "relevance": f"Skill ini relevan untuk {target_role}"
                })

    match_score = round(len(matched) / len(required_skills) * 100) if required_skills else 0

    return {
        "target_role": target_role,
        "level": level,
        "source": source,
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing[:10],
        "transferable_skills": transferable,
        "total_required": len(required_skills)
    }