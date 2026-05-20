from app.agents.extraction_agent import extract_skills_from_form
from app.agents.gap_agent import analyze_gap
from app.agents.roadmap_agent import generate_roadmap
import json

user_skills = extract_skills_from_form(
    major="Sistem Informasi",
    target_role="Data Scientist",
    self_described_skills="Saya bisa Python, pernah belajar machine learning, dan familiar dengan database SQL"
)

gap = analyze_gap(user_skills, "Data Scientist", "junior")

roadmap = generate_roadmap(
    major="Sistem Informasi",
    target_role="Data Scientist",
    level="junior",
    matched_skills=gap["matched_skills"],
    missing_skills=gap["missing_skills"],
    transferable_skills=gap["transferable_skills"]
)

print(json.dumps(roadmap, indent=2, ensure_ascii=False))