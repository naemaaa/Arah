from langgraph.graph import StateGraph, END
from typing import TypedDict
from app.agents.extraction_agent import extract_skills_from_text, extract_skills_from_form
from app.agents.gap_agent import analyze_gap
from app.agents.roadmap_agent import generate_roadmap


class ArahState(TypedDict):
    major: str
    target_role: str
    level: str
    raw_text: str
    input_type: str
    job_desc: str
    user_skills: list[str]
    gap_result: dict
    roadmap_result: dict


def extraction_node(state: ArahState) -> ArahState:
    if state["input_type"] == "cv":
        skills = extract_skills_from_text(state["raw_text"])
    else:
        skills = extract_skills_from_form(
            major=state["major"],
            target_role=state["target_role"],
            self_described_skills=state["raw_text"]
        )
    return {**state, "user_skills": skills}


def gap_node(state: ArahState) -> ArahState:
    result = analyze_gap(
        user_skills=state["user_skills"],
        target_role=state["target_role"],
        level=state["level"],
        job_desc=state.get("job_desc", "")
    )
    return {**state, "gap_result": result}


def roadmap_node(state: ArahState) -> ArahState:
    result = generate_roadmap(
        major=state["major"],
        target_role=state["target_role"],
        level=state["level"],
        matched_skills=state["gap_result"]["matched_skills"],
        missing_skills=state["gap_result"]["missing_skills"],
        transferable_skills=state["gap_result"]["transferable_skills"]
    )
    return {**state, "roadmap_result": result}


def build_graph():
    graph = StateGraph(ArahState)
    graph.add_node("extraction", extraction_node)
    graph.add_node("gap_analysis", gap_node)
    graph.add_node("roadmap", roadmap_node)
    graph.set_entry_point("extraction")
    graph.add_edge("extraction", "gap_analysis")
    graph.add_edge("gap_analysis", "roadmap")
    graph.add_edge("roadmap", END)
    return graph.compile()


arah_graph = build_graph()