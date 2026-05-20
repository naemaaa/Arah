from app.agents.extraction_agent import extract_skills_from_form
from app.agents.gap_agent import analyze_gap

user_skills = extract_skills_from_form(
    major="Sistem Informasi",
    target_role="AI Engineer",
    self_described_skills="Saya bisa Python, pernah belajar machine learning, dan familiar dengan database SQL"
)

result = analyze_gap(user_skills, "Data Scientist", "junior")

import json
print(json.dumps(result, indent=2))