from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import os
import json

load_dotenv()

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile"
)

SKILL_LIST = [
    "Python", "SQL", "Java", "JavaScript", "TypeScript", "React", "Node.js",
    "Docker", "AWS", "Git", "CI/CD", "Machine Learning", "Deep Learning",
    "TensorFlow", "PyTorch", "Data Analysis", "Data Visualization", "Power BI",
    "Tableau", "Excel", "Statistics", "Communication", "Agile", "Scrum",
    "Figma", "CSS", "HTML", "Flutter", "Kotlin", "Swift", "MongoDB",
    "PostgreSQL", "MySQL", "REST API", "GraphQL", "Kubernetes", "GCP", "Azure",
    "Product Management", "UX Research", "Wireframing", "Prototyping",
    "Business Analysis", "Project Management", "A/B Testing", "R"
]

def extract_skills_from_text(text: str) -> list[str]:
    prompt = f"""
Kamu adalah skill extractor. Tugasmu mengidentifikasi skill teknis dan non-teknis dari teks berikut.

Teks:
{text}

Skill yang tersedia (pilih HANYA dari daftar ini):
{", ".join(SKILL_LIST)}

Kembalikan HANYA JSON array of strings. Contoh: ["Python", "SQL", "Git"]
Jangan tambahkan penjelasan apapun.
"""
    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        raw = response.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1].replace("json", "").strip()
        skills = json.loads(raw)
        return [s for s in skills if s in SKILL_LIST]
    except:
        return []


def extract_skills_from_form(major: str, target_role: str, self_described_skills: str) -> list[str]:
    text = f"""
Jurusan: {major}
Target karir: {target_role}
Skill yang dimiliki (dideskripsikan sendiri): {self_described_skills}
"""
    return extract_skills_from_text(text)