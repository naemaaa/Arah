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

def load_courses():
    with open(DATA_PATH / "course_catalog.json") as f:
        return json.load(f)

def load_keywords():
    with open(DATA_PATH / "keyword_per_skill.json") as f:
        return json.load(f)

def get_courses_for_skills(missing_skills: list[str]) -> list[dict]:
    courses = load_courses()
    relevant = []

    for course in courses:
        covered = course.get("skills_covered", [])
        overlap = [s for s in missing_skills if s in covered]
        if overlap:
            relevant.append({
                **course,
                "overlap_skills": overlap,
                "overlap_count": len(overlap)
            })

    relevant.sort(key=lambda x: x["overlap_count"], reverse=True)
    return relevant[:8]

def get_keywords_for_skills(missing_skills: list[str]) -> list[dict]:
    keywords = load_keywords()
    result = []
    for item in keywords:
        if item["skill"] in missing_skills:
            result.append(item)
    return result[:5]

def generate_roadmap(
    major: str,
    target_role: str,
    level: str,
    matched_skills: list[str],
    missing_skills: list[str],
    transferable_skills: list[dict]
) -> dict:
    courses = get_courses_for_skills(missing_skills)
    keywords = get_keywords_for_skills(missing_skills)

    transferable_text = ", ".join([t["skill"] for t in transferable_skills]) if transferable_skills else "tidak ada"
    courses_text = json.dumps([{
        "title": c["title"],
        "platform": c["platform"],
        "skills_covered": c["overlap_skills"],
        "level": c["level"],
        "price": c["price"],
        "url": c["url"]
    } for c in courses[:5]], ensure_ascii=False)

    prompt = f"""
Kamu adalah career advisor untuk mahasiswa Indonesia.

Data user:
- Jurusan: {major}
- Target karir: {target_role} ({level})
- Skill yang sudah dimiliki: {", ".join(matched_skills)}
- Skill yang perlu dikembangkan: {", ".join(missing_skills[:8])}
- Transferable skills dari jurusan: {transferable_text}

Course yang tersedia:
{courses_text}

Buatkan roadmap belajar dalam format JSON berikut:
{{
  "summary": "paragraf singkat tentang posisi user dan apa yang perlu dilakukan",
  "background_strength": "jelaskan kenapa background jurusan mereka adalah kekuatan, bukan hambatan",
  "weekly_plan": [
    {{"week": "Minggu 1-2", "focus": "topik utama", "skills": ["skill1"], "action": "langkah konkret"}},
    {{"week": "Minggu 3-4", "focus": "topik utama", "skills": ["skill1"], "action": "langkah konkret"}},
    {{"week": "Minggu 5-8", "focus": "topik utama", "skills": ["skill1", "skill2"], "action": "langkah konkret"}},
    {{"week": "Minggu 9-12", "focus": "topik utama", "skills": ["skill1"], "action": "langkah konkret"}}
  ],
  "recommended_courses": [
    {{"title": "nama course", "platform": "platform", "url": "url", "priority": "high/medium"}}
  ]
}}

Kembalikan HANYA JSON, tanpa penjelasan apapun.
"""

    response = llm.invoke([HumanMessage(content=prompt)])

    try:
        raw = response.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1].replace("json", "").strip()
        return json.loads(raw)
    except:
        return {"error": "Failed to parse roadmap", "raw": response.content}