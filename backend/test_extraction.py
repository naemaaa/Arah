from app.agents.extraction_agent import extract_skills_from_form

result = extract_skills_from_form(
    major="Sistem Informasi",
    target_role="AI Engineer",
    self_described_skills="Saya bisa Python, pernah belajar machine learning, dan familiar dengan database SQL"
)

print("Extracted skills:", result)