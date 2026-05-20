from app.graph import arah_graph
import json

result = arah_graph.invoke({
    "major": "Sistem Informasi",
    "target_role": "Data Scientist",
    "level": "junior",
    "raw_text": "Saya bisa Python, pernah belajar machine learning, dan familiar dengan database SQL",
    "input_type": "form",
    "user_skills": [],
    "gap_result": {},
    "roadmap_result": {}
})

print("=== USER SKILLS ===")
print(result["user_skills"])

print("\n=== GAP RESULT ===")
print(json.dumps(result["gap_result"], indent=2))

print("\n=== ROADMAP ===")
print(json.dumps(result["roadmap_result"], indent=2, ensure_ascii=False))