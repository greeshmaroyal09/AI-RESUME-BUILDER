import json
from typing import Dict, Any

class ResumeWriterAgent:
    """
    Agent responsible for writing and optimizing resume action points, rephrasing summaries, 
    and ensuring strong professional ATS formatting without inventing details.
    """
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name

    def execute(self, profile_data: Dict[str, Any], ats_analysis: Dict[str, Any], role: str, company: str) -> Dict[str, Any]:
        # Orchestrate resume generation using backend generator service
        # In a CrewAI setup, this would map to a Task with a specific Prompt and output schema
        from app.services.resume_generator import generate_resume_with_rules, generate_resume_with_gemini
        from app.config import settings
        if settings.GEMINI_API_KEY:
            return generate_resume_with_gemini(profile_data, ats_analysis, role, company)
        else:
            return generate_resume_with_rules(profile_data, ats_analysis, role, company)


class ATSReviewerAgent:
    """
    Agent responsible for parsing the Job Description, extracting keywords, identifying 
    matching/missing skills, scoring match percentage, and highlighting strengths/weaknesses.
    """
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name

    def execute(self, profile_data: Dict[str, Any], jd_text: str, role: str, company: str) -> Dict[str, Any]:
        # Calls the ATS analysis engine
        # In a CrewAI setup, this defines a CrewAgent tasked with parsing and compliance checks.
        from app.services.ats_engine import analyze_with_gemini, analyze_with_rules
        from app.config import settings
        if settings.GEMINI_API_KEY:
            return analyze_with_gemini(profile_data, jd_text, role, company)
        else:
            return analyze_with_rules(profile_data, jd_text, role, company)


class CareerCoachAgent:
    """
    Agent responsible for designing a hyper-personalized roadmap and checklist of actions
    to bridge the identified profile gaps, suggesting certifications, and project updates.
    """
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name

    def execute(self, ats_analysis: Dict[str, Any], role: str, company: str) -> Dict[str, Any]:
        # Formulate/refine roadmap steps and return coach recommendations
        # In a CrewAI setup, this parses the reviewer's output and structures training actions.
        return {
            "recommendations": ats_analysis.get("recommendations", []),
            "improvement_roadmap": ats_analysis.get("improvement_roadmap", [])
        }


class CrewOrchestrator:
    """
    Orchestration Layer styled for future CrewAI / LangChain compatibility.
    Runs the multi-agent task flow to generate: Resume, ATS Report, and Improvement Plan.
    """
    def __init__(self):
        self.writer = ResumeWriterAgent()
        self.reviewer = ATSReviewerAgent()
        self.coach = CareerCoachAgent()

    def run_collaboration(self, profile_data: Dict[str, Any], jd_text: str, role: str, company: str) -> Dict[str, Any]:
        """
        Runs the full agentic collaboration workflow.
        """
        # Step 1: ATS Reviewer Agent analyzes gaps
        ats_report = self.reviewer.execute(profile_data, jd_text, role, company)
        
        # Step 2: Resume Writer Agent tailors content based on gaps
        tailored_resume = self.writer.execute(profile_data, ats_report, role, company)
        
        # Step 3: Career Coach Agent reviews outputs and styles the improvement roadmap
        coach_output = self.coach.execute(ats_report, role, company)
        
        return {
            "resume": tailored_resume,
            "ats_report": ats_report,
            "improvement_plan": {
                "recommendations": coach_output["recommendations"],
                "improvement_roadmap": coach_output["improvement_roadmap"]
            }
        }
